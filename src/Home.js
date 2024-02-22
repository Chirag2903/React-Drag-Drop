import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import "./Home.css";
import data from "./data";

const Home = () => {
    const [leftBoxes, setLeftBoxes] = useState(() => {
        const savedBoxes = localStorage.getItem('leftBoxes');
        return savedBoxes ? JSON.parse(savedBoxes) : [];
    });
    const [rightBoxes, setRightBoxes] = useState(data);
    const [disabledBoxes, setDisabledBoxes] = useState([]);

    // useEffect to update localStorage whenever leftBoxes changes
    useEffect(() => {
        localStorage.setItem('leftBoxes', JSON.stringify(leftBoxes));
    }, [leftBoxes]);

    const moveBox = (dragIndex, hoverIndex) => {
        const dragBox = leftBoxes[dragIndex];
        setLeftBoxes((prevBoxes) => {
            const updatedBoxes = [...prevBoxes];
            updatedBoxes.splice(dragIndex, 1);
            updatedBoxes.splice(hoverIndex, 0, dragBox);
            return updatedBoxes;
        });
    };

    const handleAdd = (box) => {
        if (!leftBoxes.some(item => item.id === box.id)) {
            setLeftBoxes([...leftBoxes, box]);
            setDisabledBoxes([...disabledBoxes, box]);
        } else {
            alert('This image is already added.');
        }
    };

    const handleDelete = (box) => {
        setLeftBoxes(leftBoxes.filter((item) => item.id !== box.id));
        setDisabledBoxes(disabledBoxes.filter((item) => item.id !== box.id));
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className='home'>
                <div className="container-1">
                    {leftBoxes.map((box, index) => (
                        <Box
                            key={box.id}
                            id={box.id}
                            index={index}
                            image={box.image}
                            moveBox={moveBox}
                            leftBoxes={leftBoxes}
                        />
                    ))}
                </div>
                <div className="container-2">
                    {rightBoxes.map((boxes, index) => (
                        <div className="container-2-images" key={index}>
                            <img src={boxes.image} alt={`images-${index}`} />
                            <div className='container-2-button'>
                                <button
                                    onClick={() => handleAdd(boxes)}
                                    disabled={disabledBoxes.some(item => item.id === boxes.id)}
                                    className={disabledBoxes.some(item => item.id === boxes.id) ? 'disabled-button' : ''}
                                >Add</button>
                                <button onClick={() => handleDelete(boxes)}>
                                    <img width="10" height="10" src="https://img.icons8.com/papercut/60/trash.png" alt="trash" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DndProvider>
    );
};

const Box = ({ id, image, index, moveBox, leftBoxes }) => {
    const ref = React.useRef(null);
    const widthStyle = index === 0 || index === leftBoxes.length - 1 ? "full-width" : "half-width";

    const [, drop] = useDrop({
        accept: 'box',
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) {
                return;
            }
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            moveBox(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: 'box',
        item: () => {
            return { id, index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0.4 : 1;
    drag(drop(ref));

    return (
        <div ref={ref} style={{ opacity }} className={`container-1-images ${widthStyle}`}>
            <img src={image} alt={`imagess-${index}`} />
        </div>
    );
};

export default Home;
