import { Liveblocks } from '@liveblocks/node';

const key = process.env.NEXT_PUBLIC_LIVEBLOCKS_SECRET_KEY;

if (!key) {
    throw new Error('LIVEBLOCKS_SECRET_KEY is not set');
}

const liveblocks = new Liveblocks({
    secret: key,
});

export default liveblocks;