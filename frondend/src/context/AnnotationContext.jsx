import React, { createContext, useState, useCallback, useContext } from 'react';

const AnnotationContext = createContext();

export const useAnnotationContext = () => useContext(AnnotationContext);

export const AnnotationProvider = ({ children }) => {
    const [annotations, setAnnotations] = useState([]);
    const [scrollHandler, setScrollHandler] = useState(null);
    // 🌟 THÊM STATE ĐỂ LƯU HÀM XÓA DOM/CONTEXT TỪ HIGHLIGHTER 🌟
    const [removeAnnotationHandler, setRemoveAnnotationHandler] = useState(null); 

    const addAnnotation = useCallback((newAnnotation) => {
        setAnnotations(prev => [...prev, newAnnotation]);
    }, []);

    const removeAnnotation = useCallback((id) => {
        setAnnotations(prev => prev.filter(ann => ann.id !== id));
    }, []);

    const editAnnotation = useCallback((id, newNoteText) => {
        setAnnotations(prev => 
            prev.map(ann => 
                ann.id === id ? { ...ann, note: newNoteText } : ann
            )
        );
    }, []);

    const value = {
        annotations,
        addAnnotation,
        removeAnnotation, 
        editAnnotation, 
        scrollHandler,
        setScrollHandler,
        removeAnnotationHandler, // EXPORT GETTER
        setRemoveAnnotationHandler, // EXPORT SETTER
    };

    return (
        <AnnotationContext.Provider value={value}>
            {children}
        </AnnotationContext.Provider>
    );
};
