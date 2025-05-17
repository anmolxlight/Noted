// src/ai/flows/import-and-summarize.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for importing notes from plain text files
 * and generating a summary of the key topics covered in the imported notes.
 *
 * - importAndSummarize - A function that handles the note import and summarization process.
 * - ImportAndSummarizeInput - The input type for the importAndSummarize function.
 * - ImportAndSummarizeOutput - The return type for the importAndSummarize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImportAndSummarizeInputSchema = z.object({
  noteContent: z
    .string()
    .describe('The content of the note to be imported.'),
});
export type ImportAndSummarizeInput = z.infer<typeof ImportAndSummarizeInputSchema>;

const ImportAndSummarizeOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of the key topics covered in the imported note.'),
});
export type ImportAndSummarizeOutput = z.infer<typeof ImportAndSummarizeOutputSchema>;

export async function importAndSummarize(input: ImportAndSummarizeInput): Promise<ImportAndSummarizeOutput> {
  return importAndSummarizeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'importAndSummarizePrompt',
  input: {schema: ImportAndSummarizeInputSchema},
  output: {schema: ImportAndSummarizeOutputSchema},
  prompt: `You are an expert note summarizer.  Please read the note below and provide a summary of the key topics covered in the note.

Note Content:
-----------
{{{noteContent}}}
-----------
Summary: `,
});

const importAndSummarizeFlow = ai.defineFlow(
  {
    name: 'importAndSummarizeFlow',
    inputSchema: ImportAndSummarizeInputSchema,
    outputSchema: ImportAndSummarizeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
