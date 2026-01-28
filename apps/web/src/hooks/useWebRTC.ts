import { useState, useCallback, useRef, useEffect } from 'react';
import { Device } from 'mediasoup-client';
import type { Transport, Producer, Consumer } from 'mediasoup-client/lib/types';
import { useMediaSocket } from './useMediaSocket';

interface Peer {
  id: string;
  stream: MediaStream;
}

export function useWebRTC(roomId: string | null) {
  const { emitWithAck, on } = useMediaSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);
  const producersRef = useRef<Map<string, Producer>>(new Map());
  const consumersRef = useRef<Map<string, Consumer>>(new Map());
  const peerStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const cleanedUpRef = useRef(false);

  const updatePeers = useCallback(() => {
    const list: Peer[] = [];
    for (const [id, stream] of peerStreamsRef.current) {
      list.push({ id, stream });
    }
    setPeers([...list]);
  }, []);

  const consumeProducer = useCallback(async (
    producerId: string,
    peerId: string,
  ) => {
    const device = deviceRef.current;
    const recvTransport = recvTransportRef.current;
    if (!device || !recvTransport) return;

    const consumeResult = await emitWithAck<{
      id: string;
      producerId: string;
      kind: string;
      rtpParameters: any;
    }>('consume', { producerId, rtpCapabilities: device.rtpCapabilities });

    const consumer = await recvTransport.consume({
      id: consumeResult.id,
      producerId: consumeResult.producerId,
      kind: consumeResult.kind as 'audio' | 'video',
      rtpParameters: consumeResult.rtpParameters,
    });

    consumersRef.current.set(consumer.id, consumer);

    await emitWithAck('resume', { consumerId: consumer.id });

    let stream = peerStreamsRef.current.get(peerId);
    if (!stream) {
      stream = new MediaStream();
      peerStreamsRef.current.set(peerId, stream);
    }
    stream.addTrack(consumer.track);
    updatePeers();
  }, [emitWithAck, updatePeers]);

  const init = useCallback(async () => {
    if (!roomId) return;
    cleanedUpRef.current = false;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 320, height: 240 },
    });
    setLocalStream(stream);

    // Join room and get router capabilities + existing producers
    const { rtpCapabilities, existingProducers } = await emitWithAck<{
      rtpCapabilities: any;
      existingProducers: Array<{ peerId: string; producerId: string; kind: string }>;
    }>('joinRoom', { roomId });

    // Load device
    const device = new Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });
    deviceRef.current = device;

    // Create send transport
    const sendParams = await emitWithAck<{
      id: string;
      iceParameters: any;
      iceCandidates: any;
      dtlsParameters: any;
    }>('createWebRtcTransport', { direction: 'send' });

    const sendTransport = device.createSendTransport({
      id: sendParams.id,
      iceParameters: sendParams.iceParameters,
      iceCandidates: sendParams.iceCandidates,
      dtlsParameters: sendParams.dtlsParameters,
    });

    sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
      emitWithAck('connectTransport', { transportId: sendTransport.id, dtlsParameters })
        .then(() => callback())
        .catch(errback);
    });

    sendTransport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
      emitWithAck<{ producerId: string }>('produce', {
        transportId: sendTransport.id,
        kind,
        rtpParameters,
      })
        .then(({ producerId }) => callback({ id: producerId }))
        .catch(errback);
    });

    sendTransportRef.current = sendTransport;

    // Create recv transport
    const recvParams = await emitWithAck<{
      id: string;
      iceParameters: any;
      iceCandidates: any;
      dtlsParameters: any;
    }>('createWebRtcTransport', { direction: 'recv' });

    const recvTransport = device.createRecvTransport({
      id: recvParams.id,
      iceParameters: recvParams.iceParameters,
      iceCandidates: recvParams.iceCandidates,
      dtlsParameters: recvParams.dtlsParameters,
    });

    recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
      emitWithAck('connectTransport', { transportId: recvTransport.id, dtlsParameters })
        .then(() => callback())
        .catch(errback);
    });

    recvTransportRef.current = recvTransport;

    // Produce local tracks
    for (const track of stream.getTracks()) {
      const producer = await sendTransport.produce({ track });
      producersRef.current.set(producer.id, producer);
    }

    // Consume existing producers
    for (const { producerId, peerId } of existingProducers) {
      await consumeProducer(producerId, peerId);
    }
  }, [roomId, emitWithAck, consumeProducer]);

  // Listen for new producers, peer leaving, producer closed
  useEffect(() => {
    const unsubs: Array<() => void> = [];

    unsubs.push(on('newProducer', async ({ producerId, peerId }: { producerId: string; peerId: string }) => {
      await consumeProducer(producerId, peerId);
    }));

    unsubs.push(on('peerLeft', ({ peerId }: { peerId: string }) => {
      peerStreamsRef.current.delete(peerId);
      updatePeers();
    }));

    unsubs.push(on('producerClosed', ({ consumerId }: { consumerId: string }) => {
      const consumer = consumersRef.current.get(consumerId);
      if (consumer) {
        consumer.close();
        consumersRef.current.delete(consumerId);
      }
      // Remove tracks that are ended from peer streams
      for (const [peerId, stream] of peerStreamsRef.current) {
        const activeTracks = stream.getTracks().filter(t => t.readyState === 'live');
        if (activeTracks.length === 0) {
          peerStreamsRef.current.delete(peerId);
        }
      }
      updatePeers();
    }));

    return () => unsubs.forEach(u => u());
  }, [on, consumeProducer, updatePeers]);

  const toggleAudio = useCallback(() => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setAudioEnabled(prev => !prev);
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setVideoEnabled(prev => !prev);
  }, [localStream]);

  const cleanup = useCallback(() => {
    if (cleanedUpRef.current) return;
    cleanedUpRef.current = true;

    localStream?.getTracks().forEach(t => t.stop());
    producersRef.current.forEach(p => p.close());
    consumersRef.current.forEach(c => c.close());
    sendTransportRef.current?.close();
    recvTransportRef.current?.close();
    peerStreamsRef.current.clear();

    if (roomId) {
      emitWithAck('leaveRoom', { roomId }).catch(() => {});
    }

    setLocalStream(null);
    setPeers([]);
  }, [localStream, roomId, emitWithAck]);

  useEffect(() => { return cleanup; }, []);

  return {
    localStream,
    peers,
    audioEnabled,
    videoEnabled,
    init,
    toggleAudio,
    toggleVideo,
    cleanup,
  };
}
