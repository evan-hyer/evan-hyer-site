import { createApp } from './app';
import { listen } from '../../../packages/server/src/index';
listen(createApp(), 'profile', 4001);
