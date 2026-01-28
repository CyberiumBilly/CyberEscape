import type {
  Router,
  Worker,
  WebRtcTransport,
  Producer,
  Consumer,
  DtlsParameters,
  MediaKind,
  RtpParameters,
  RtpCapabilities,
} from "mediasoup/node/lib/types.js";
import type { Socket } from "socket.io";
import { config } from "./config.js";
import pino from "pino";

const logger = pino({ name: "room-manager" });

interface Peer {
  socket: Socket;
  transports: Map<string, WebRtcTransport>;
  producers: Map<string, Producer>;
  consumers: Map<string, Consumer>;
}

interface Room {
  router: Router;
  peers: Map<string, Peer>;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private workers: Worker[];
  private routers: Router[] = [];
  private nextWorkerIdx = 0;

  constructor(workers: Worker[]) {
    this.workers = workers;
  }

  async createRoom(roomId: string): Promise<Room> {
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId)!;
    }

    const worker = this.workers[this.nextWorkerIdx];
    this.nextWorkerIdx = (this.nextWorkerIdx + 1) % this.workers.length;

    const router = await worker.createRouter({
      mediaCodecs: config.routerMediaCodecs,
    });

    this.routers.push(router);

    const room: Room = {
      router,
      peers: new Map(),
    };

    this.rooms.set(roomId, room);
    logger.info({ roomId }, "Room created");
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRtpCapabilities(roomId: string): RtpCapabilities | undefined {
    const room = this.rooms.get(roomId);
    return room?.router.rtpCapabilities;
  }

  async addPeer(roomId: string, peerId: string, socket: Socket): Promise<void> {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = await this.createRoom(roomId);
    }

    const peer: Peer = {
      socket,
      transports: new Map(),
      producers: new Map(),
      consumers: new Map(),
    };

    room.peers.set(peerId, peer);
    logger.info({ roomId, peerId }, "Peer added to room");
  }

  removePeer(roomId: string, peerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const peer = room.peers.get(peerId);
    if (!peer) return;

    for (const consumer of peer.consumers.values()) {
      consumer.close();
    }
    for (const producer of peer.producers.values()) {
      producer.close();
    }
    for (const transport of peer.transports.values()) {
      transport.close();
    }

    room.peers.delete(peerId);
    logger.info({ roomId, peerId }, "Peer removed from room");

    if (room.peers.size === 0) {
      this.closeRoom(roomId);
    }
  }

  async createTransport(
    roomId: string,
    peerId: string,
    direction: "send" | "recv"
  ): Promise<{
    id: string;
    iceParameters: unknown;
    iceCandidates: unknown;
    dtlsParameters: unknown;
  }> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found: " + roomId);

    const peer = room.peers.get(peerId);
    if (!peer) throw new Error("Peer not found: " + peerId);

    const transport = await room.router.createWebRtcTransport({
      ...config.webRtcTransportOptions,
      appData: { direction, peerId },
    });

    if (config.webRtcTransportOptions.maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(
          config.webRtcTransportOptions.maxIncomingBitrate
        );
      } catch (e) {
        logger.warn(e, "Failed to set max incoming bitrate");
      }
    }

    transport.on("dtlsstatechange", (dtlsState: string) => {
      if (dtlsState === "closed") {
        logger.info({ transportId: transport.id }, "Transport DTLS closed");
        transport.close();
      }
    });

    transport.on("@close", () => {
      logger.info({ transportId: transport.id }, "Transport closed");
    });

    peer.transports.set(transport.id, transport);

    logger.info(
      { roomId, peerId, direction, transportId: transport.id },
      "Transport created"
    );

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }

  async connectTransport(
    roomId: string,
    peerId: string,
    transportId: string,
    dtlsParameters: DtlsParameters
  ): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found: " + roomId);

    const peer = room.peers.get(peerId);
    if (!peer) throw new Error("Peer not found: " + peerId);

    const transport = peer.transports.get(transportId);
    if (!transport) throw new Error("Transport not found: " + transportId);

    await transport.connect({ dtlsParameters });
    logger.info({ roomId, peerId, transportId }, "Transport connected");
  }

  async produce(
    roomId: string,
    peerId: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters
  ): Promise<string> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found: " + roomId);

    const peer = room.peers.get(peerId);
    if (!peer) throw new Error("Peer not found: " + peerId);

    const transport = peer.transports.get(transportId);
    if (!transport) throw new Error("Transport not found: " + transportId);

    const producer = await transport.produce({ kind, rtpParameters });

    peer.producers.set(producer.id, producer);

    producer.on("transportclose", () => {
      logger.info({ producerId: producer.id }, "Producer transport closed");
      producer.close();
      peer.producers.delete(producer.id);
    });

    logger.info(
      { roomId, peerId, producerId: producer.id, kind },
      "Producer created"
    );

    return producer.id;
  }

  async consume(
    roomId: string,
    peerId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities
  ): Promise<{
    id: string;
    producerId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
  }> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found: " + roomId);

    const peer = room.peers.get(peerId);
    if (!peer) throw new Error("Peer not found: " + peerId);

    if (!room.router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error("Cannot consume producer: " + producerId);
    }

    const recvTransport = Array.from(peer.transports.values()).find(
      (t) => t.appData.direction === "recv"
    );

    let transport: WebRtcTransport | undefined = recvTransport;
    if (!transport) {
      transport = Array.from(peer.transports.values())[
        peer.transports.size - 1
      ];
    }
    if (!transport) throw new Error("No recv transport found for peer: " + peerId);

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: true,
    });

    peer.consumers.set(consumer.id, consumer);

    consumer.on("transportclose", () => {
      logger.info({ consumerId: consumer.id }, "Consumer transport closed");
      consumer.close();
      peer.consumers.delete(consumer.id);
    });

    consumer.on("producerclose", () => {
      logger.info({ consumerId: consumer.id }, "Consumer producer closed");
      peer.socket.emit("producerClosed", { consumerId: consumer.id });
      consumer.close();
      peer.consumers.delete(consumer.id);
    });

    logger.info(
      { roomId, peerId, consumerId: consumer.id, producerId },
      "Consumer created"
    );

    return {
      id: consumer.id,
      producerId: consumer.producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }

  async resumeConsumer(
    roomId: string,
    peerId: string,
    consumerId: string
  ): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found: " + roomId);

    const peer = room.peers.get(peerId);
    if (!peer) throw new Error("Peer not found: " + peerId);

    const consumer = peer.consumers.get(consumerId);
    if (!consumer) throw new Error("Consumer not found: " + consumerId);

    await consumer.resume();
    logger.info({ roomId, peerId, consumerId }, "Consumer resumed");
  }

  closeProducer(roomId: string, peerId: string, producerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const peer = room.peers.get(peerId);
    if (!peer) return;

    const producer = peer.producers.get(producerId);
    if (!producer) return;

    producer.close();
    peer.producers.delete(producerId);
    logger.info({ roomId, peerId, producerId }, "Producer closed");
  }

  getProducersForPeer(
    roomId: string,
    excludePeerId: string
  ): Array<{ peerId: string; producerId: string; kind: MediaKind }> {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const producers: Array<{
      peerId: string;
      producerId: string;
      kind: MediaKind;
    }> = [];

    for (const [peerId, peer] of room.peers) {
      if (peerId === excludePeerId) continue;
      for (const [producerId, producer] of peer.producers) {
        producers.push({
          peerId,
          producerId,
          kind: producer.kind,
        });
      }
    }

    return producers;
  }

  closeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const [peerId] of room.peers) {
      this.removePeer(roomId, peerId);
    }

    room.router.close();
    this.rooms.delete(roomId);
    logger.info({ roomId }, "Room closed");
  }

  getOtherPeerSockets(roomId: string, excludePeerId: string): Socket[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const sockets: Socket[] = [];
    for (const [peerId, peer] of room.peers) {
      if (peerId !== excludePeerId) {
        sockets.push(peer.socket);
      }
    }
    return sockets;
  }
}
