import { App } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function saveHtmlAsPdf(
  html: string,
  savePath: string,
  app: App,
  width: number, // centimeters
  height: number // centimeters
): Promise<boolean> {
  try {
    // Store HTML as a file in a temp directory
    const tempRoot = app.getPath('temp');
    const filename = path.parse(savePath).name;
    const htmlPath = path.join(tempRoot, `${filename}.html`);
    await fs.writeFile(htmlPath, html, { encoding: 'utf-8' });

    // Path to Edge executable
    const edgePath = `C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe`;

    // Command to open Edge with the print preview for the HTML file
    const command = `"${edgePath}" --print --no-margins "${htmlPath}"`;

    // Execute the command to open Edge
    await execPromise(command);

    // Clean up the temporary HTML file
    // Use a timeout to ensure Edge has enough time to open before deleting the file
    setTimeout(async () => {
      try {
        await fs.unlink(htmlPath);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Failed to delete temp HTML file: ${error.message}`);
        } else {
          console.error('Failed to delete temp HTML file: Unknown error');
        }
      }
    }, 5000); // 5 seconds delay to ensure Edge has time to process

    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to save HTML as PDF: ${error.message}`);
    } else {
      console.error('Failed to save HTML as PDF: Unknown error');
    }
    return false;
  }
}
