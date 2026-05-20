export interface ClipboardItem {
  type: "text" | "image";
  content?: string;
  imageUrl?: string;
  imageId?: string;
  filename?: string;
  timestamp: number;
}
