import { Redis } from '@upstash/redis';

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Room key helper - rooms expire in 24 hours
const ROOM_TTL = 60 * 60 * 24;

export async function getRoom(roomId: string) {
    return redis.get<import('@/types/game').Room>(`room:${roomId}`);
}

export async function setRoom(roomId: string, room: import('@/types/game').Room) {
    await redis.set(`room:${roomId}`, room, { ex: ROOM_TTL });
}

export async function deleteRoom(roomId: string) {
    await redis.del(`room:${roomId}`);
}
