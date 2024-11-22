import React, { useState } from 'react';

const WallVisualizer: React.FC = () => {
    const [width, setWidth] = useState<number>(4);
    const [height, setHeight] = useState<number>(2);
    const [walls, setWalls] = useState<number[][][]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const generateWalls = () => {
        setLoading(true);
        const worker = new Worker(new URL('./wallWorker.ts', import.meta.url));

        worker.postMessage({ width, height });

        worker.onmessage = (event) => {
            setWalls(event.data);
            setLoading(false);
            worker.terminate();
        };

        worker.onerror = (error) => {
            console.error('Error in Web Worker:', error);
            setLoading(false);
        };
    };

    const renderRow = (row: number[]) =>
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
            <h1>Wall Visualizer with Web Workers</h1>
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
            {loading && <p>Generating walls, please wait...</p>}
            <div>
                {walls.length > 0 && !loading ? (
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
                    !loading && <p>No walls generated yet. Adjust dimensions and click "Generate Walls".</p>
                )}
            </div>
        </div>
    );
};

export default WallVisualizer;
