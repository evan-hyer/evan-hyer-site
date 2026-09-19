import { createApp } from './app';
import { listen } from '../../../packages/server/src/index';
listen(createApp(), 'projects', 4002);
