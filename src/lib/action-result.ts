export type ActionResult<TData = undefined> =
  | { success: true; data: TData }
  | { success: false; message: string; fieldErrors?: Record<string, string> };
