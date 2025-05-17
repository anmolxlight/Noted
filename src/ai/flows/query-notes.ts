// Use server directive is required for Genkit flows.
'use server';

/**
 * @fileOverview Implements a RAG system to query user notes and provide answers with references.
 *
 * - queryNotes - A function that accepts a question and note content, and returns an answer with references to the notes.
 * - QueryNotesInput - The input type for the queryNotes function.
 * - QueryNotesOutput - The return type for the queryNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the queryNotes function
const QueryNotesInputSchema = z.object({
  question: z.string().describe('The question to ask about the notes.'),
  notes: z.array(
    z.object({
      title: z.string().describe('The title of the note.'),
      content: z.string().describe('The content of the note.'),
    })
  ).describe('An array of notes to query.'),
});
export type QueryNotesInput = z.infer<typeof QueryNotesInputSchema>;

// Define the output schema for the queryNotes function
const QueryNotesOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, based on the notes.'),
  references: z.array(
    z.object({
      noteTitle: z.string().describe('The title of the note the reference is from.'),
      lines: z.array(z.number()).describe('The line numbers in the note that support the answer.'),
    })
  ).describe('References to the notes and lines that support the answer.'),
});
export type QueryNotesOutput = z.infer<typeof QueryNotesOutputSchema>;

// Exported function to query notes
export async function queryNotes(input: QueryNotesInput): Promise<QueryNotesOutput> {
  return queryNotesFlow(input);
}

// Define the prompt for querying notes
const queryNotesPrompt = ai.definePrompt({
  name: 'queryNotesPrompt',
  input: {schema: QueryNotesInputSchema},
  output: {schema: QueryNotesOutputSchema},
  prompt: `You are an AI assistant that answers questions based on a collection of notes.

  Notes:
  {{#each notes}}
  Title: {{this.title}}
  Content:
  {{this.content}}
  \n---\n  {{/each}}

  Question: {{question}}

  Answer the question using only the information provided in the notes.  For each sentence in your answer, cite the specific notes and line numbers that support it.

  Format your response as follows:
  {
    "answer": "The answer to the question.",
    "references": [
      {
        "noteTitle": "The title of the note",
        "lines": [1, 2, 3] // The line numbers that support the answer
      }
    ]
  }

  If a note is not relevant, do not include it in the references.
  `,
});

// Define the flow for querying notes
const queryNotesFlow = ai.defineFlow(
  {
    name: 'queryNotesFlow',
    inputSchema: QueryNotesInputSchema,
    outputSchema: QueryNotesOutputSchema,
  },
  async input => {
    const {output} = await queryNotesPrompt(input);
    return output!;
  }
);
