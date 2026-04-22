import fs from "fs";
import path from "path";

export default function Home() {
  const filePath = path.join(process.cwd(), "public", "madeinproject.html");
  const htmlContent = fs.readFileSync(filePath, "utf-8");
  
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
