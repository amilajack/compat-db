import PostChecks from './PostChecks';

process.on('uncaughtException', err => {
  throw err;
});

PostChecks();
