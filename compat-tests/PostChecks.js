import { RecordsValidator } from '../src/helpers/RecordsValidator';


RecordsValidator().catch((error) => {
  console.log(error);
  process.exit(1);
});
