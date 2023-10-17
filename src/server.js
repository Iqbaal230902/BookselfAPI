const { nanoid } = require("nanoid");
const Hapi = require("@hapi/hapi");

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: "localhost",
  });

  let books = [];

  server.route({
    method: "POST",
    path: "/books",
    handler: (request, h) => {
      try {
        const {
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          reading,
        } = request.payload;

        if (!name) {
          throw new Error("Gagal menambahkan buku. Mohon isi nama buku");
        }

        if (readPage > pageCount) {
          throw new Error(
            "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount"
          );
        }

        const id = nanoid(16);
        const finished = pageCount === readPage;
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;

        const newBook = {
          id,
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          finished,
          reading,
          insertedAt,
          updatedAt,
        };

        books.push(newBook);

        return h
          .response({
            status: "success",
            message: "Buku berhasil ditambahkan",
            data: {
              bookId: id,
            },
          })
          .code(201);
      } catch (error) {
        return h
          .response({
            status: "fail",
            message: error.message,
          })
          .code(400);
      }
    },
  });

  server.route({
    method: "GET",
    path: "/books/{id}",
    handler: (request, h) => {
      const { id } = request.params;
      const book = books.find((book) => book.id === id);

      if (!book) {
        return h
          .response({
            status: "fail",
            message: "Buku tidak ditemukan",
          })
          .code(404);
      }

      return h
        .response({
          status: "success",
          data: {
            book,
          },
        })
        .code(200);
    },
  });

  server.route({
    method: "GET",
    path: "/books",
    handler: (request, h) => {
      const booksData = books.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher,
      }));

      return h
        .response({
          status: "success",
          data: {
            books: booksData,
          },
        })
        .code(200);
    },
  });

  server.route({
    method: "PUT",
    path: "/books/{id}",
    handler: (request, h) => {
      try {
        const { id } = request.params;
        const {
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          reading,
        } = request.payload;

        if (!name) {
          throw new Error("Gagal memperbarui buku. Mohon isi nama buku");
        }

        if (readPage > pageCount) {
          throw new Error(
            "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
          );
        }

        const index = books.findIndex((book) => book.id === id);

        if (index === -1) {
          return h
            .response({
              status: "fail",
              message: "Gagal memperbarui buku. Id tidak ditemukan",
            })
            .code(404);
        }

        const finished = pageCount === readPage;

        books[index] = {
          ...books[index],
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          finished,
          reading,
          updatedAt: new Date().toISOString(),
        };

        return h
          .response({
            status: "success",
            message: "Buku berhasil diperbarui",
          })
          .code(200);
      } catch (error) {
        return h
          .response({
            status: "fail",
            message: error.message,
          })
          .code(400);
      }
    },
  });

  server.route({
    method: "DELETE",
    path: "/books/{id}",
    handler: (request, h) => {
      const { id } = request.params;
      const index = books.findIndex((book) => book.id === id);

      if (index === -1) {
        return h
          .response({
            status: "fail",
            message: "Buku gagal dihapus. Id tidak ditemukan",
          })
          .code(404);
      }

      books.splice(index, 1);

      return h
        .response({
          status: "success",
          message: "Buku berhasil dihapus",
        })
        .code(200);
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
