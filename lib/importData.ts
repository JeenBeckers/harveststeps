export type ImportRow = {
  id: string;
  name: string;
  client: string;
  start: string;
};

/**
 * One-time bulk import list, cleaned per Jeen's review (2026-08-09):
 * placeholder/non-name rows dropped, ABN -> ABN AMRO, Essent 1/2/3 -> Essent,
 * Liesbeth's start moved to 1 sep 2026.
 */
export const IMPORT_HARVESTERS: ImportRow[] = [
  { id: "imp-lucasdobbelsteen", name: "Lucas Dobbelsteen", client: "Essent", start: "1 sep 2023" },
  { id: "imp-jeffreylint", name: "Jeffrey Lint", client: "ASN bank", start: "7 jan 2026" },
  { id: "imp-steffanopsathas", name: "Steffano Psathas", client: "CGI", start: "5 jan 2026" },
  { id: "imp-lindageraets", name: "Linda Geraets", client: "DELA", start: "12 jan 2026" },
  { id: "imp-wietsebosman", name: "Wietse Bosman", client: "Essent", start: "1 jan 2026" },
  { id: "imp-casperhildebrand", name: "Casper Hildebrand", client: "Tikkie", start: "16 feb 2026" },
  { id: "imp-bramelderhorst", name: "Bram Elderhorst", client: "Essent", start: "23 feb 2026" },
  { id: "imp-juliusdejeu", name: "Julius de Jeu", client: "Essent", start: "16 feb 2026" },
  { id: "imp-eduardklein", name: "Eduard Klein", client: "ABN AMRO", start: "2 mrt 2026" },
  { id: "imp-luciaknoppe", name: "Lucia Knoppe", client: "Lumera", start: "1 mrt 2026" },
  { id: "imp-thomaskuiper", name: "Thomas Kuiper", client: "UWV", start: "1 mrt 2026" },
  { id: "imp-larsvanderwater", name: "Lars van der Water", client: "UWV", start: "1 mrt 2026" },
  { id: "imp-rubenwolter", name: "Ruben Wolter", client: "Essent", start: "9 apr 2026" },
  { id: "imp-dominiquelawson", name: "Dominique Lawson", client: "ABN AMRO", start: "11 mei 2026" },
  { id: "imp-raulmihalca", name: "Raul Mihalca", client: "Dela", start: "1 mei 2027" },
  { id: "imp-nielslazaroms", name: "Niels Lazaroms", client: "Essent", start: "1 mei 2027" },
  { id: "imp-alexfrancis", name: "Alex Francis", client: "ABN AMRO", start: "1 mei 2027" },
  { id: "imp-rikvanschaik", name: "Rik van Schaik", client: "KPN", start: "1 mei 2026" },
  { id: "imp-robertvandenbrink", name: "Robert van den Brink", client: "RIVM", start: "1 jun 2026" },
  { id: "imp-dinabellouki", name: "Dina Bellouki", client: "ABN AMRO", start: "30 jun 2027" },
  { id: "imp-sophia", name: "Sophia", client: "ABN AMRO", start: "1 jul 2026" },
  { id: "imp-milakasteel", name: "Mila Kasteel", client: "ABN AMRO", start: "27 jul 2027" },
  { id: "imp-finolaparkinson", name: "Finola Parkinson", client: "ABN AMRO", start: "27 jul 2027" },
  { id: "imp-liesbethoogh", name: "Liesbeth Oogh", client: "ABN AMRO", start: "1 sep 2026" },
  { id: "imp-sahar", name: "Sahar", client: "ABN AMRO", start: "1 sep 2026" },
  { id: "imp-muna", name: "Muna", client: "ABN AMRO", start: "1 sep 2026" },
  { id: "imp-lisarabbers", name: "Lisa Rabbers", client: "Triodosbank", start: "1 sep 2026" },
  { id: "imp-martijnfrericks", name: "Martijn Frericks", client: "Triodosbank", start: "1 sep 2026" },
  { id: "imp-clintonemok", name: "Clinton Emok", client: "Essent", start: "1 sep 2026" },
  { id: "imp-jeroenpullen", name: "Jeroen Pullen", client: "Nog te matchen", start: "1 okt 2026" },
  { id: "imp-michaelmoor", name: "Michael Moor", client: "BBTG", start: "1 okt 2026" },
];
