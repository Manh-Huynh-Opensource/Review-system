import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { Stage, Layer, Line, Rect, Arrow, Transformer, Image as KonvaImage } from 'react-konva'
import { Button } from '@/components/ui/button'
import { Save, Loader2, MousePointer2, Move, Pen, Eraser, Square, ArrowUpRight, Minus, Plus } from 'lucide-react'
import useImage from 'use-image'

export interface CanvasEditorHandle {
    addAsset: (url: string, type: 'image' | 'video', name: string) => void
}

interface CanvasEditorProps {
    initialData: any
    onSave: (data: any) => Promise<void>
    readOnly?: boolean
}

// Sub-component for rendering images to handle useImage hook cleanly
const URLImage = ({ image, shapeProps, onSelect, onChange, isReadOnly }: any) => {
    const [img] = useImage(image.src, 'anonymous')
    const shapeRef = useRef<any>(null)

    useEffect(() => {
        if (img) {
            // Auto-size if not set (first load of new asset)
            if (!shapeProps.width) {
                onChange({
                    ...shapeProps,
                    width: 300,
                    height: 300 * (img.height / img.width)
                })
            }
        }
    }, [img])

    return (
        <KonvaImage
            image={img}
            x={shapeProps.x}
            y={shapeProps.y}
            width={shapeProps.width}
            height={shapeProps.height}
            rotation={shapeProps.rotation}
            scaleX={shapeProps.scaleX}
            scaleY={shapeProps.scaleY}
            draggable={!isReadOnly}
            onClick={onSelect}
            onTap={onSelect}
            ref={shapeRef}
            onDragEnd={(e) => {
                onChange({
                    ...shapeProps,
                    x: e.target.x(),
                    y: e.target.y(),
                })
            }}
            onTransformEnd={() => {
                const node = shapeRef.current
                if (!node) return
                const scaleX = node.scaleX()
                const scaleY = node.scaleY()
                node.scaleX(1)
                node.scaleY(1)
                onChange({
                    ...shapeProps,
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(5, node.height() * scaleY),
                    rotation: node.rotation(),
                })
            }}
        />
    )
}

export const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(({ initialData, onSave, readOnly }, ref) => {
    const [tool, setTool] = useState<'select' | 'hand' | 'pen' | 'rect' | 'arrow' | 'eraser'>('select')
    const [shapes, setShapes] = useState<any[]>(initialData?.shapes || [])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [stagePos, setStagePos] = useState(initialData?.stagePos || { x: 0, y: 0 })
    const [stageScale, setStageScale] = useState(initialData?.stageScale || 1)
    const [color, setColor] = useState('#000000')
    const [strokeWidth, setStrokeWidth] = useState(2)

    const stageRef = useRef<any>(null)
    const isDrawing = useRef(false)

    // Sync initial data if it changes (for version switching)
    useEffect(() => {
        if (initialData) {
            setShapes(initialData.shapes || [])
            setStagePos(initialData.stagePos || { x: 0, y: 0 })
            setStageScale(initialData.stageScale || 1)
        }
    }, [initialData])

    useImperativeHandle(ref, () => ({
        addAsset: (url: string, type: 'image' | 'video', name: string) => {
            const stage = stageRef.current
            // Center in current view
            const stageCenter = {
                x: (-stagePos.x + (stage?.width() || 800) / 2) / stageScale,
                y: (-stagePos.y + (stage?.height() || 600) / 2) / stageScale
            }

            // Using type to differentiate (VIDEO TODO)
            const newShape = {
                id: `img_${Date.now()}`,
                type: 'image', // For now Konva only supports Image node easily, video needs custom element
                assetType: type, // Store original type
                src: url,
                x: stageCenter.x - 150,
                y: stageCenter.y - 150,
                width: 300,
                height: 200,
                name
            }
            setShapes((prev: any[]) => [...prev, newShape])
        }
    }))

    const handleSaveClick = async () => {
        setSaving(true)
        try {
            // Save pure JSON data, not the canvas image
            const data = {
                shapes,
                stagePos,
                stageScale
            }
            await onSave(data)
        } catch (error) {
            console.error('Save failed:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleMouseDown = (e: any) => {
        if (readOnly) return
        if (tool === 'select' || tool === 'hand') return

        const stage = e.target.getStage()
        const pos = stage.getRelativePointerPosition()
        isDrawing.current = true

        const id = `s_${Date.now()}`

        if (tool === 'pen') {
            setShapes([...shapes, { id, type: 'line', points: [pos.x, pos.y], stroke: color, strokeWidth: strokeWidth }])
            setSelectedId(id)
        } else if (tool === 'rect') {
            setShapes([...shapes, { id, type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0, stroke: color, strokeWidth: strokeWidth }])
            setSelectedId(id)
        } else if (tool === 'arrow') {
            setShapes([...shapes, { id, type: 'arrow', points: [pos.x, pos.y, pos.x, pos.y], stroke: color, strokeWidth: strokeWidth }])
            setSelectedId(id)
        }
    }

    const handleMouseMove = (e: any) => {
        if (!isDrawing.current || readOnly) return

        const stage = e.target.getStage()
        const pos = stage.getRelativePointerPosition()

        setShapes(prev => {
            const lastShape = prev[prev.length - 1]
            if (!lastShape) return prev

            const newShapes = [...prev]

            if (tool === 'pen') {
                lastShape.points = lastShape.points.concat([pos.x, pos.y])
            } else if (tool === 'rect') {
                lastShape.width = pos.x - lastShape.x
                lastShape.height = pos.y - lastShape.y
            } else if (tool === 'arrow') {
                lastShape.points = [lastShape.points[0], lastShape.points[1], pos.x, pos.y]
            }

            newShapes[newShapes.length - 1] = lastShape
            return newShapes
        })
    }

    const handleMouseUp = () => {
        isDrawing.current = false
    }

    const handleWheel = (e: any) => {
        e.evt.preventDefault()
        const scaleBy = 1.1
        const stage = e.target.getStage()
        const oldScale = stage.scaleX()
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
        }

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
        setStageScale(newScale)

        setStagePos({
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
        })
    }

    // Transformers
    const trRef = useRef<any>(null)
    useEffect(() => {
        if (selectedId && trRef.current) {
            const node = stageRef.current.findOne('#' + selectedId)
            if (node) {
                trRef.current.nodes([node])
                trRef.current.getLayer().batchDraw()
            }
        } else if (trRef.current) {
            trRef.current.nodes([])
        }
    }, [selectedId, shapes])


    const containerRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                })
            }
        }

        updateDimensions()
        window.addEventListener('resize', updateDimensions)
        return () => window.removeEventListener('resize', updateDimensions)
    }, [])

    return (
        <div ref={containerRef} className="relative w-full h-full bg-[#f8f9fa] overflow-hidden">
            {/* Save Button & Status */}
            {!readOnly && (
                <div className="absolute top-4 right-4 z-10">
                    <Button onClick={handleSaveClick} disabled={saving} className="shadow-lg gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu
                    </Button>
                </div>
            )}

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                    backgroundSize: `${20 * stageScale}px ${20 * stageScale}px`,
                    backgroundPosition: `${stagePos.x}px ${stagePos.y}px`
                }}
            />

            {/* Toolbar */}
            {!readOnly && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-2 items-center">
                    <div className="flex gap-1 bg-white p-1.5 rounded-lg shadow-md border ring-1 ring-black/5">
                        <Button variant={tool === 'select' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('select')} title="Select (V)"><MousePointer2 className="w-4 h-4" /></Button>
                        <Button variant={tool === 'hand' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('hand')} title="Hand (H)"><Move className="w-4 h-4" /></Button>
                        <div className="w-px bg-border mx-1 h-8" />
                        <Button variant={tool === 'pen' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('pen')} title="Pen (P)"><Pen className="w-4 h-4" /></Button>
                        <Button variant={tool === 'rect' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('rect')} title="Rectangle (R)"><Square className="w-4 h-4" /></Button>
                        <Button variant={tool === 'arrow' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('arrow')} title="Arrow (A)"><ArrowUpRight className="w-4 h-4" /></Button>
                        <div className="w-px bg-border mx-1 h-8" />
                        <Button variant={tool === 'eraser' ? 'destructive' : 'ghost'} size="icon" onClick={() => {
                            if (selectedId) {
                                setShapes(shapes.filter(s => s.id !== selectedId))
                                setSelectedId(null)
                            }
                        }} title="Delete Selected (Del)" disabled={!selectedId}><Eraser className="w-4 h-4" /></Button>
                    </div>

                    {/* Style Controls (Only show when Pen/Rect/Arrow active) */}
                    {(tool === 'pen' || tool === 'rect' || tool === 'arrow') && (
                        <div className="flex gap-2 bg-white p-1.5 rounded-lg shadow-md border ring-1 ring-black/5 animate-in slide-in-from-top-2 fade-in">
                            <div className="flex gap-1">
                                {['#000000', '#df4b26', '#10b981', '#3b82f6'].map(c => (
                                    <button
                                        key={c}
                                        className={`w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setColor(c)}
                                    />
                                ))}
                            </div>
                            <div className="w-px bg-border mx-1" />
                            <div className="flex items-center gap-1">
                                {[2, 4, 8].map(s => (
                                    <button
                                        key={s}
                                        className={`w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100 ${strokeWidth === s ? 'bg-slate-100 ring-1 ring-black/20' : ''}`}
                                        onClick={() => setStrokeWidth(s)}
                                    >
                                        <div className="bg-black rounded-full" style={{ width: s, height: s }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-4 z-10 flex gap-1 bg-white p-1 rounded-lg shadow-md border ring-1 ring-black/5">
                <Button variant="ghost" size="icon" onClick={() => setStageScale((s: number) => s / 1.1)}><Minus className="w-4 h-4" /></Button>
                <div className="flex items-center px-2 text-xs font-mono min-w-[3rem] justify-center">{Math.round(stageScale * 100)}%</div>
                <Button variant="ghost" size="icon" onClick={() => setStageScale((s: number) => s * 1.1)}><Plus className="w-4 h-4" /></Button>
            </div>


            {/* Stage */}
            <Stage
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                draggable={tool === 'hand'}
                x={stagePos.x}
                y={stagePos.y}
                scaleX={stageScale}
                scaleY={stageScale}
                onDragEnd={(e) => {
                    // Only update if it's the stage dragging (hand tool)
                    if (e.target === e.target.getStage()) {
                        setStagePos({ x: e.target.x(), y: e.target.y() })
                    }
                }}
                ref={stageRef}
                className={tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : tool === 'select' ? 'cursor-default' : 'cursor-crosshair'}
            >
                <Layer>
                    {shapes.map((shape, i) => {
                        if (shape.type === 'line') {
                            return <Line
                                key={shape.id}
                                id={shape.id}
                                points={shape.points}
                                stroke={shape.stroke}
                                strokeWidth={shape.strokeWidth}
                                tension={0.5}
                                lineCap="round"
                                draggable={tool === 'select' && !readOnly}
                                onClick={() => tool === 'select' && setSelectedId(shape.id)}
                            />
                        }
                        if (shape.type === 'rect') {
                            return <Rect
                                key={shape.id}
                                id={shape.id}
                                x={shape.x}
                                y={shape.y}
                                width={shape.width}
                                height={shape.height}
                                stroke={shape.stroke}
                                strokeWidth={shape.strokeWidth}
                                draggable={tool === 'select' && !readOnly}
                                onClick={() => tool === 'select' && setSelectedId(shape.id)}
                            />
                        }
                        if (shape.type === 'arrow') {
                            return <Arrow
                                key={shape.id}
                                id={shape.id}
                                points={shape.points}
                                stroke={shape.stroke}
                                strokeWidth={shape.strokeWidth}
                                draggable={tool === 'select' && !readOnly}
                                onClick={() => tool === 'select' && setSelectedId(shape.id)}
                            />
                        }
                        if (shape.type === 'image') {
                            return <URLImage
                                key={shape.id}
                                shapeProps={shape}
                                isReadOnly={readOnly}
                                onSelect={() => tool === 'select' && setSelectedId(shape.id)}
                                onChange={(newAttrs: any) => {
                                    if (readOnly) return
                                    const newShapes = shapes.slice()
                                    newShapes[i] = newAttrs
                                    setShapes(newShapes)
                                }}
                            />
                        }
                        return null
                    })}
                    {!readOnly && <Transformer ref={trRef} />}
                </Layer>
            </Stage>
        </div>
    )
})
