/**
 * Myers Diff Algorithm Implementation
 * Generates line-by-line redline diffs between legislative text versions.
 */

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export function computeMyersDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const n = oldLines.length;
  const m = newLines.length;
  const max = n + m;
  const v: Record<number, number> = { 1: 0 };
  const trace: Record<number, number>[] = [];

  for (let d = 0; d <= max; d++) {
    trace.push({ ...v });
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && (v[k - 1] ?? -1) < (v[k + 1] ?? -1))) {
        x = v[k + 1] ?? 0;
      } else {
        x = (v[k - 1] ?? 0) + 1;
      }
      let y = x - k;

      while (x < n && y < m && oldLines[x] === newLines[y]) {
        x++;
        y++;
      }
      v[k] = x;

      if (x >= n && y >= m) {
        return backtrack(trace, oldLines, newLines, d);
      }
    }
  }

  return backtrack(trace, oldLines, newLines, max);
}

function backtrack(trace: Record<number, number>[], oldLines: string[], newLines: string[], d: number): DiffLine[] {
  let x = oldLines.length;
  let y = newLines.length;
  const result: DiffLine[] = [];

  for (let step = d; step > 0; step--) {
    const v = trace[step];
    const k = x - y;
    let prevK: number;

    if (k === -step || (k !== step && (v[k - 1] ?? -1) < (v[k + 1] ?? -1))) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }

    const prevX = v[prevK] ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      x--;
      y--;
      result.unshift({ type: 'unchanged', text: oldLines[x], oldLineNumber: x + 1, newLineNumber: y + 1 });
    }

    if (x > prevX) {
      x--;
      result.unshift({ type: 'removed', text: oldLines[x], oldLineNumber: x + 1 });
    } else if (y > prevY) {
      y--;
      result.unshift({ type: 'added', text: newLines[y], newLineNumber: y + 1 });
    }
  }

  while (x > 0 && y > 0) {
    x--;
    y--;
    result.unshift({ type: 'unchanged', text: oldLines[x], oldLineNumber: x + 1, newLineNumber: y + 1 });
  }

  return result;
}
