export const generateRows = (width: number): number[][] => {
    if (width === 0) return [[]];
    if (width < 0) return [];

    const rows: number[][] = [];
    [1, 2, 3, 4].forEach((brick) => {
        const subRows = generateRows(width - brick);
        subRows.forEach((row) => rows.push([brick, ...row]));
    });
    return rows;
};

export const getCutPoints = (row: number[]): number[] => {
    const points: number[] = [];
    let position = 0;
    for (let i = 0; i < row.length - 1; i++) {
        position += row[i];
        points.push(position);
    }
    return points;
};

export const isCompatible = (row1: number[], row2: number[]): boolean => {
    const cuts1 = getCutPoints(row1);
    const cuts2 = getCutPoints(row2);
    return !cuts1.some((point) => cuts2.includes(point));
};

export const generateWalls = (width: number, height: number): number[][][] => {
    const rows = generateRows(width);

    const compatibility: Record<string, number[][]> = {};
    rows.forEach((row) => {
        compatibility[row.join(',')] = rows.filter((otherRow) =>
            isCompatible(row, otherRow)
        );
    });

    let dp: number[][][][] = rows.map((row) => [[[...row]]]);

    for (let h = 2; h <= height; h++) {
        const newDp: number[][][][] = [];
        rows.forEach((row, index) => {
            const compatibleWalls = compatibility[row.join(',')]
                .flatMap((compatibleRow) =>
                    dp[rows.findIndex((r) => r.join(',') === compatibleRow.join(','))]
                        .map((wall) => [row, ...wall])
                );
            newDp[index] = compatibleWalls;
        });
        dp = newDp;
    }

    return dp.flat();
};

self.onmessage = (event) => {
    const { width, height } = event.data;
    const walls = generateWalls(width, height);
    self.postMessage(walls);
};
