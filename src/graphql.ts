// Inline GraphQL operation strings (dogfood idiom). These MUST stay in
// agreement with `backend/schema/schema.graphql` — co-authored in the same
// task. The shape is exercised structurally by the materialised golden
// (AI6P-1649) and proven end-to-end at the live sacrificial run (S6).

export const listNotesQuery = /* GraphQL */ `
  query ListNotes {
    listNotes {
      id
      title
      createdAt
    }
  }
`;

export const createNoteMutation = /* GraphQL */ `
  mutation CreateNote($title: String!) {
    createNote(title: $title) {
      id
      title
      createdAt
    }
  }
`;

export interface Note {
  id: string;
  title: string;
  createdAt: string;
}
