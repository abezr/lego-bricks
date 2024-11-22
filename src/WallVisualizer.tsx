import React, { useState } from 'react';

// Define types for rows and walls
type Row = number[];
type Wall = Row[];

// Helper function to generate all valid rows of width `w`
const generateRows = (width: number): Row[] => {
    if (width === 0) return [[]];
    if (width < 0) return [];

    const rows: Row[] = [];
    [1, 2, 3, 4].forEach((brick) => {
        const subRows = generateRows(width - brick);
        subRows.forEach((row) => rows.push([brick, ...row]));
    });
    return rows;
};

// Helper function to calculate cut points in a row
const getCutPoints = (row: Row): number[] => {
    const points: number[] = [];
    let position = 0;
    for (let i = 0; i < row.length - 1; i++) {
        position += row[i];
        points.push(position);
    }
    return points;
};

// Helper function to check if two rows are compatible
const isCompatible = (row1: Row, row2: Row): boolean => {
    const cuts1 = getCutPoints(row1);
    const cuts2 = getCutPoints(row2);
    return !cuts1.some((point) => cuts2.includes(point));
};

// Main React Component
const WallVisualizer: React.FC = () => {
    const [width, setWidth] = useState<number>(4);
    const [height, setHeight] = useState<number>(2);
    const [walls, setWalls] = useState<Wall[]>([]);

    // Generate all valid walls
    const generateWalls = () => {
        const rows = generateRows(width);

        // Build compatibility graph
        const compatibility: Record<string, Row[]> = {};
        rows.forEach((row) => {
            compatibility[row.join(',')] = rows.filter((otherRow) =>
                isCompatible(row, otherRow)
            );
        });

        // Dynamic programming to find all valid walls
        let dp: Wall[][] = rows.map((row) => [[[...row]]]); // Base case: height 1
        for (let h = 2; h <= height; h++) {
            const newDp: Wall[][] = [];
            rows.forEach((row, index) => {
                const compatibleWalls: Wall[] = compatibility[row.join(',')]
                    .flatMap((compatibleRow) =>
                        dp[rows.findIndex((r) => r.join(',') === compatibleRow.join(','))]
                            .map((wall) => [row, ...wall])
                    );
                newDp[index] = compatibleWalls;
            });
            dp = newDp;
        }

        // Flatten all valid walls
        const allWalls: Wall[] = dp.flat();
        setWalls(allWalls);
    };

    // Render a single row as bricks
    const renderRow = (row: Row) =>
        row.map((brick, index) => (
            <div
                key={index}
                style={{
                    display: 'inline-block',
                    width: `${brick * 20}px`,
                    height: '20px',
                    backgroundColor: 'orange',
                    border: '1px solid black',
                }}
            ></div>
        ));

    return (
        <div style={{ padding: '20px' }}>
            <h1>Wall Visualizer</h1>
            <div style={{ marginBottom: '20px' }}>
                <label>
                    Width:
                    <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value)))}
                        min="1"
                    />
                </label>
                <label style={{ marginLeft: '10px' }}>
                    Height:
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value)))}
                        min="1"
                    />
                </label>
                <button onClick={generateWalls} style={{ marginLeft: '10px' }}>
                    Generate Walls
                </button>
            </div>
            <div>
                {walls.length > 0 ? (
                    walls.map((wall, wallIndex) => (
                        <div
                            key={wallIndex}
                            style={{ marginBottom: '20px', display: 'inline-block' }}
                        >
                            {wall.map((row, rowIndex) => (
                                <div key={rowIndex} style={{ display: 'flex' }}>
                                    {renderRow(row)}
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p>No walls generated yet. Adjust dimensions and click "Generate Walls".</p>
                )}
            </div>
        </div>
    );
};

export default WallVisualizer;
