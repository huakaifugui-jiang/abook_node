//首先实现第一步 const app = express();
//app.listen(3000)
//接下来app.get('path')
import http from 'http';
import app, { Application } from './application';

function createApplication(): Application {
  return app;
}

export default createApplication;
