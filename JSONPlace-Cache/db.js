import * as SQLite from 'expo-sqlite/legacy';

const db = SQLite.openDatabase("jsonplace-cache.db");

// Cria a tabela de Comments
export const createTableComments = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY NOT NULL,
        postId INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        body TEXT NOT NULL
      );`,
      [],
      () => console.log("Tabela 'comments' criada com sucesso."),
      (_, error) => console.error("Erro ao criar tabela 'comments':", error)
    );
  });
};

// Consulta Comments do banco local
export const getCommentsDB = (postId, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM comments WHERE postId = ?;`,
      [postId],
      (_, { rows }) => callback(rows._array || []),
      (_, error) => console.error("Erro ao consultar comments:", error)
    );
  });
};

// Insere Comments no banco local
export const insertCommentsDB = (comments) => {
  if (!Array.isArray(comments)) {
    console.error("O parâmetro 'comments' deve ser um array.");
    return;
  }

  db.transaction(tx => {
    comments.forEach(comment => {
      tx.executeSql(
        `INSERT OR IGNORE INTO comments (id, postId, name, email, body) VALUES (?, ?, ?, ?, ?);`,
        [comment.id, comment.postId, comment.name, comment.email, comment.body],
        () => console.log(`Comment ${comment.id} inserido com sucesso.`),
        (_, error) => console.error("Erro ao inserir comment:", error)
      );
    });
  });
};

// Atualiza um Comment no banco local
export const updateCommentDB = (comment) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE comments SET name = ?, email = ?, body = ? WHERE id = ?;`,
      [comment.name, comment.email, comment.body, comment.id],
      () => console.log(`Comment ${comment.id} atualizado com sucesso.`),
      (_, error) => console.error("Erro ao atualizar comment:", error)
    );
  });
};

// Deleta um Comment do banco local
export const deleteCommentDB = (commentId) => {
  db.transaction(tx => {
    tx.executeSql(
      `DELETE FROM comments WHERE id = ?;`,
      [commentId],
      () => console.log(`Comment ${commentId} deletado com sucesso.`),
      (_, error) => console.error("Erro ao deletar comment:", error)
    );
  });
};
