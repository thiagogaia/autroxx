// wa-sqlite.d.ts — Declarações de tipo para wa-sqlite

declare module 'wa-sqlite/dist/wa-sqlite-async.mjs' {
  export default function SQLiteESMFactory(): any;
}

declare module 'wa-sqlite/dist/wa-sqlite-opfs-async.mjs' {
  export default function(): Promise<any>;
}
