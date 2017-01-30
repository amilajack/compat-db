import { join } from 'path';
import Providers from '../src/providers/Providers';
import PrepareDatabase from '../src/database/PrepareDatabase';


PrepareDatabase(Providers(), join(__dirname, '..', 'lib', 'all.json'));
