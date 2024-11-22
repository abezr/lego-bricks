import React, { useState, useEffect, useRef } from 'react';
import './WallVisualizer.css'; // CSS file for styles

// Function to generate rows based on the given width
const generateRows = (width: number): number[][] => {
    if (width === 0) return [[]];
    if (width < 0) return [];
    const rows: number[][] = [];
    [1, 2, 3, 4].forEach((brick) => {
        const subRows = generateRows(width - brick);
        subRows.forEach((row) => rows.push([brick, ...row]));
    });
    return rows;
};

// Function to check if two rows are compatible (no vertical cuts aligned)
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

const WallVisualizer: React.FC = () => {
    const [width, setWidth] = useState<number>(6);
    const [height, setHeight] = useState<number>(3);
    const [currentWall, setCurrentWall] = useState<number[][]>([]);
    const [walls, setWalls] = useState<number[][][]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const rows = generateRows(width);
        const compatibility: Record<string, number[][]> = {};

        // Build the compatibility map
        rows.forEach((row) => {
            compatibility[row.join(',')] = rows.filter((otherRow) =>
                isCompatible(row, otherRow)
            );
        });

        // Generate all possible walls recursively
        const results: number[][][] = [];
        const buildWalls = (currentWall: number[][], remainingHeight: number) => {
            if (remainingHeight === 0) {
                results.push([...currentWall]);
                return;
            }
            rows.forEach((row) => {
                if (currentWall.length === 0 || isCompatible(currentWall[currentWall.length - 1], row)) {
                    buildWalls([...currentWall, row], remainingHeight - 1);
                }
            });
        };

        buildWalls([], height);
        setWalls(results);
    }, [width, height]);

    useEffect(() => {
        if (walls.length === 0) return;

        let currentIndex = 0;
        setCurrentWall(walls[currentIndex]);

        intervalRef.current = setInterval(() => {
            currentIndex = (currentIndex + 1) % walls.length;
            setCurrentWall(walls[currentIndex]);
        }, 2000); // Change wall every 2 seconds

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [walls]);

    return (
        <div className="wall-visualizer">
            <h1>Wall Visualizer with Animated Block Transitions</h1>
            <div className="controls">
                <label>
                    Width:
                    <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value)))}
                    />
                </label>
                <label>
                    Height:
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value)))}
                    />
                </label>
            </div>
            <div className="wall-container">
                {currentWall.map((row, rowIndex) => (
                    <div className="row" key={rowIndex}>
                        {row.map((block, blockIndex) => (
                            <div
                                className="block"
                                key={blockIndex}
                                style={{
                                    width: `${block * 40}px`, // Scale block width
                                    height: '40px', // Fixed height for blocks
                                    backgroundColor: `hsl(${(blockIndex * 50) % 360}, 70%, 70%)`,
                                    transition: 'all 0.5s ease', // Smooth transition
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WallVisualizer;
