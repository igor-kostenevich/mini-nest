import "reflect-metadata"
import {BooksModule} from "./apps/books/books.module";
import {NestFactory} from "./core/nest-factory";

//catch uncaughtException
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Handle the error or exit the process
  // process.exit(1); // Uncomment to exit the process
});

(async () => {
  const app = await NestFactory.create(BooksModule);

  const port = 3005;

  app.listen(port, () => console.log(`Mini-Nest listening on http://localhost:${port}`));
})();
