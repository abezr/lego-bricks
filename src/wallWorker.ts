export {}
/* eslint-disable-next-line no-restricted-globals */
self.onmessage = (e) => {
    const { rows, compatibility, height } = e.data;
    let result: number[][][] = [];

    // Function to generate walls with the given height
    const generateWallsRecursive = (currentWall: number[][], remainingHeight: number) => {
        if (remainingHeight === 0) {
            result.push([...currentWall]); // Wall is complete, add it to the result
            return;
        }
        if (remainingHeight < 0) return; // Overflow, stop recursion

        // Try to add each row and recursively complete the wall
        rows.forEach((row:number[]) => {
            if (currentWall.length === 0 || isCompatible(currentWall[currentWall.length - 1], row)) {
                generateWallsRecursive([...currentWall, row], remainingHeight - 1);
            }
        });
    };

    // Start generating walls
    generateWallsRecursive([], height);

    // Post results back to the main thread
    result.forEach((wall, index) => {
        postMessage({ wall, index });
    });
};

// Helper function to check row compatibility
const getCutPoints = (row: number[]): number[] => {
    const points: number[] = [];
    let position = 0;
    for (let i = 0; i < row.length - 1; i++) {
        position += row[i];
        points.push(position);
    }
    return points;
};

const isCompatible = (row1: number[], row2: number[]): boolean => {
    const cuts1 = getCutPoints(row1);
    const cuts2 = getCutPoints(row2);
    return !cuts1.some((point) => cuts2.includes(point)); // Ensure no cuts are aligned
};
