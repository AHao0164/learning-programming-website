import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { BookOpen, Edit, Trash, FileText, Code2, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

import { RichTextEditor } from '../../components/admin/RichTextEditor';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

import { 
    getAdminCourseById, 
    createChapter, updateChapter, deleteChapter, 
    createLesson, updateLessonContent, deleteLesson,
    getProblemsByLessonId, createProblem, updateProblem, deleteProblem, generateProblemWithAI
} from '../../../../services/admin.service'; 

const lessonTypeOptions = [
    { key: 'theory', label: 'Lý thuyết / Soạn thảo' },
    { key: 'video', label: 'Video' },
    { key: 'coding', label: 'Coding' }
];

const languageOptions = [
    { key: 'c', label: 'C' },
    { key: 'csharp', label: 'C#' },
    { key: 'java', label: 'Java' },
    { key: 'nodejs', label: 'NodeJS' }
];

const escapeHtml = (value = '') => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const languageKeywords = {
    c: ['int', 'char', 'float', 'double', 'if', 'else', 'for', 'while', 'return', 'void', 'struct', 'include'],
    csharp: ['public', 'private', 'class', 'static', 'void', 'string', 'int', 'using', 'namespace', 'return', 'if', 'else', 'new'],
    java: ['public', 'private', 'class', 'static', 'void', 'String', 'int', 'return', 'if', 'else', 'new', 'import'],
    nodejs: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'await', 'async', 'import', 'from', 'require']
};
const highlightCodeByLanguage = (languageKey, sourceCode = '') => {
    const keywords = languageKeywords[languageKey] || [];
    if (!sourceCode) return '';
    const escaped = escapeHtml(sourceCode);
    if (keywords.length === 0) return escaped.replace(/(\/\/.*)$/gm, '<span style="color:#64748b;">$1</span>').replace(/(".*?"|'.*?')/g, '<span style="color:#16a34a;">$1</span>');
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    return escaped.replace(/(\/\/.*)$/gm, '<span style="color:#64748b;">$1</span>').replace(/(".*?"|'.*?')/g, '<span style="color:#16a34a;">$1</span>').replace(keywordRegex, '<span style="color:#7c3aed;font-weight:600;">$1</span>');
};

const toEmbedUrl = (url = '') => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
};

const createEmptyProblemForm = () => ({
    title: '',
    description: '',
    difficulty: 'Easy',
    language: 'java',
    timeLimit: 1,
    memoryLimit: 128,
    starterCode: '',
    solutionCode: '',
    hints: '',
    sampleTestCases: [{ input: '', expected: '' }],
    hiddenTestCases: [{ input: '', expected: '' }]
});

const toProblemForm = (problem = {}) => {
    let sample = problem.sampleTestCases || [];
    if (sample.length === 0) sample = [{ input: '', expected: '' }];

    let hidden = problem.hiddenTestCases || [];
    if (hidden.length === 0) hidden = [{ input: '', expected: '' }];

    return {
        ...createEmptyProblemForm(),
        ...problem,
        sampleTestCases: sample,
        hiddenTestCases: hidden
    };
};

export const CourseBuilder = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [selectedLessonId, setSelectedLessonId] = useState(null);

    const [moduleTitle, setModuleTitle] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonTypeToCreate, setLessonTypeToCreate] = useState('theory');

    const [isEditingLesson, setIsEditingLesson] = useState(false);
    const [lessonEditForm, setLessonEditForm] = useState({ title: '', lessonType: 'theory' });
    const [lastSavedAt, setLastSavedAt] = useState(null);

    const [problems, setProblems] = useState([]);
    const [editingProblemId, setEditingProblemId] = useState(null);
    const [problemAiPrompt, setProblemAiPrompt] = useState('');
    const [problemForm, setProblemForm] = useState(createEmptyProblemForm());
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: 'Xác nhận', message: '', onConfirm: () => {} });


    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await getAdminCourseById(courseId);
                const fetchedCourse = res.data;
                
                const formattedCourse = {
                    ...fetchedCourse,
                    id: fetchedCourse._id,
                    name: fetchedCourse.title,
                    modules: (fetchedCourse.modules || []).map(module => ({
                        ...module,
                        id: module._id,
                        lessons: (module.lessons || []).map(lesson => ({
                            ...lesson,
                            id: lesson._id,
                            lessonType: lesson.type || 'theory'
                        }))
                    }))
                };
                
                setCourse(formattedCourse);

                if (formattedCourse.modules.length > 0) {
                    setSelectedModuleId(formattedCourse.modules[0].id);
                    if (formattedCourse.modules[0].lessons.length > 0) {
                        setSelectedLessonId(formattedCourse.modules[0].lessons[0].id);
                    }
                }
            } catch (error) {
                toast.error("Lỗi tải thông tin khóa học!");
                navigate('/admin/courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, navigate]);

    const selectedModule = useMemo(() => course?.modules?.find(m => m.id === selectedModuleId) || null, [course, selectedModuleId]);
    const selectedLesson = useMemo(() => selectedModule?.lessons?.find(l => l.id === selectedLessonId) || null, [selectedModule, selectedLessonId]);
    const selectedLessonTypeLabel = useMemo(() => lessonTypeOptions.find(item => item.key === (selectedLesson?.lessonType || 'theory'))?.label || 'Lý thuyết', [selectedLesson?.lessonType]);

    useEffect(() => {
        const fetchProblems = async () => {
            if (selectedLesson?.lessonType === 'coding') {
                try {
                    const res = await getProblemsByLessonId(selectedLesson.id);
                    const problemList = res.data?.data || res.data || [];
                    setProblems(problemList.map(p => ({ ...p, id: p._id })));
                } catch (error) {
                    setProblems([]);
                }
            } else {
                setProblems([]);
            }
        };
        fetchProblems();
    }, [selectedLesson?.id, selectedLesson?.lessonType]);

    const handleAddModule = async () => {
        if (!moduleTitle.trim()) return;
        toast.loading('Đang thêm chương...', { id: 'add-mod' });
        try {
            const res = await createChapter(course.id, { title: moduleTitle, order: course.modules.length + 1 });
            const newModule = { ...res.data, id: res.data._id, lessons: [] };
            setCourse(prev => ({ ...prev, modules: [...prev.modules, newModule] }));
            setSelectedModuleId(newModule.id);
            setModuleTitle('');
            toast.success('Thêm chương thành công!', { id: 'add-mod' });
        } catch(err) { toast.error('Lỗi thêm chương', { id: 'add-mod' }); }
    };

    const handleEditModule = async (moduleId, currentTitle) => {
        const nextTitle = window.prompt('Nhập tên chương mới:', currentTitle);
        if (!nextTitle || !nextTitle.trim() || nextTitle.trim() === currentTitle) return;
        toast.loading('Đang cập nhật...', { id: 'edit-mod' });
        try {
            await updateChapter(moduleId, { title: nextTitle.trim() });
            setCourse(prev => ({ ...prev, modules: prev.modules.map(m => m.id === moduleId ? { ...m, title: nextTitle.trim() } : m) }));
            toast.success('Đã đổi tên chương!', { id: 'edit-mod' });
        } catch(err) { toast.error('Lỗi cập nhật', { id: 'edit-mod' }); }
    };

    const handleDeleteModule = (moduleId) => {
        setConfirmConfig({
            isOpen: true,
            message: 'CẢNH BÁO: Xóa chương sẽ xóa TOÀN BỘ bài học bên trong. Tiếp tục?',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                toast.loading('Đang xóa...', { id: 'del-mod' });
                try {
                    await deleteChapter(moduleId);
                    const nextModules = course.modules.filter(m => m.id !== moduleId);
                    setCourse(prev => ({ ...prev, modules: nextModules }));
                    if (selectedModuleId === moduleId) {
                        setSelectedModuleId(nextModules[0]?.id || null);
                        setSelectedLessonId(nextModules[0]?.lessons?.[0]?.id || null);
                    }
                    toast.success('Đã xóa chương!', { id: 'del-mod' });
                } catch(err) { toast.error('Lỗi xóa chương', { id: 'del-mod' }); }
            }
        });
    };

    const handleAddLesson = async () => {
        if (!selectedModuleId || !lessonTitle.trim()) return;
        toast.loading('Đang thêm bài học...', { id: 'add-les' });
        try {
            const res = await createLesson(selectedModuleId, { title: lessonTitle, type: lessonTypeToCreate, order: selectedModule.lessons.length + 1 });
            const newLesson = { ...res.data, id: res.data._id, lessonType: res.data.type || 'theory' };
            setCourse(prev => ({ ...prev, modules: prev.modules.map(m => m.id === selectedModuleId ? { ...m, lessons: [...m.lessons, newLesson] } : m) }));
            setSelectedLessonId(newLesson.id);
            setLessonTitle('');
            toast.success('Thêm bài học thành công!', { id: 'add-les' });
        } catch(err) { toast.error('Lỗi thêm bài học', { id: 'add-les' }); }
    };

    const handleSaveLessonEdit = async () => {
        if (!selectedLesson || !lessonEditForm.title.trim()) return;
        toast.loading('Đang cập nhật...', { id: 'edit-les' });
        try {
            await updateLessonContent(selectedLesson.id, { title: lessonEditForm.title.trim(), type: lessonEditForm.lessonType });
            setCourse(prev => ({
                ...prev, modules: prev.modules.map(m => m.id === selectedModuleId ? {
                    ...m, lessons: m.lessons.map(l => l.id === selectedLesson.id ? { ...l, title: lessonEditForm.title.trim(), lessonType: lessonEditForm.lessonType } : l)
                } : m)
            }));
            setIsEditingLesson(false);
            toast.success('Cập nhật bài học thành công!', { id: 'edit-les' });
        } catch(err) { toast.error('Lỗi cập nhật', { id: 'edit-les' }); }
    };

    const handleDeleteLesson = () => {
        setConfirmConfig({
            isOpen: true,
            message: 'Xóa bài học này sẽ xóa luôn TOÀN BỘ Bài tập bên trong. Chắc chắn chứ?',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                toast.loading('Đang xóa...', { id: 'del-les' });
                try {
                    await deleteLesson(selectedLesson.id);
                    const nextLessons = selectedModule.lessons.filter(l => l.id !== selectedLesson.id);
                    setCourse(prev => ({
                        ...prev, modules: prev.modules.map(m => m.id === selectedModuleId ? { ...m, lessons: nextLessons } : m)
                    }));
                    setSelectedLessonId(nextLessons[0]?.id || null);
                    toast.success('Đã xóa bài học!', { id: 'del-les' });
                } catch(err) { toast.error('Lỗi xóa bài học', { id: 'del-les' }); }
            }
        });
    };

    const handleSaveLessonContentToDB = async () => {
        toast.loading('Đang lưu bài giảng...', { id: 'save-content' });
        try {
            await updateLessonContent(selectedLesson.id, { title: selectedLesson.title, content: selectedLesson.content, videoUrl: selectedLesson.videoUrl });
            setLastSavedAt(new Date());
            toast.success('Đã lưu nội dung!', { id: 'save-content' });
        } catch(err) { toast.error('Lỗi lưu nội dung', { id: 'save-content' }); }
    };

    const updateSelectedLessonData = (updater) => {
        setCourse(prev => ({
            ...prev, modules: prev.modules.map(m => m.id === selectedModuleId ? {
                ...m, lessons: m.lessons.map(l => l.id === selectedLesson.id ? updater(l) : l)
            } : m)
        }));
    };

    const resetProblemForm = () => {
        setProblemForm(createEmptyProblemForm());
        setEditingProblemId(null);
        setProblemAiPrompt('');
    };

    const handleSaveProblem = async (e) => {
        e.preventDefault();
        if (!problemForm.title.trim()) return;
        if (!problemForm.description.trim()) {
            toast.error('Vui lòng nhập mô tả đề bài');
            return;
        }
        const payload = {
            ...problemForm,
            timeLimit: Number(problemForm.timeLimit),
            memoryLimit: Number(problemForm.memoryLimit),
            linkedCourseId: course.id,
            linkedModuleId: selectedModuleId,
            linkedLessonId: selectedLesson.id
        };
        
        toast.loading('Đang lưu bài tập...', { id: 'save-prob' });
        try {
            if (editingProblemId) {
                const res = await updateProblem(editingProblemId, payload);
                const updatedProblem = res.data?.data || res.data;
                setProblems(prev => prev.map(p => p.id === editingProblemId ? { ...updatedProblem, id: updatedProblem._id } : p));
                toast.success('Cập nhật thành công!', { id: 'save-prob' });
            } else {
                const res = await createProblem(payload);
                const newProblem = res.data?.data || res.data;
                setProblems(prev => [...prev, { ...newProblem, id: newProblem._id }]);
                toast.success('Tạo thành công!', { id: 'save-prob' });
            }
            resetProblemForm();
        } catch(err) { toast.error('Lỗi lưu bài tập', { id: 'save-prob' }); }
    };

    const handleGenerateProblemWithAI = async () => {
        if (!problemAiPrompt.trim()) return toast.error("Nhập yêu cầu cho AI!");
        toast.loading("AI đang soạn đề bài...", { id: 'ai' });
        try {
            const res = await generateProblemWithAI({ prompt: problemAiPrompt, language: problemForm.language });
            const aiData = res.data || res;
            
            setProblemForm(prev => ({
                ...prev,
                title: aiData.title || prev.title,
                description: aiData.description || prev.description,
                starterCode: aiData.starterCode || prev.starterCode,
                solutionCode: aiData.solutionCode || prev.solutionCode,
                hints: aiData.hints || prev.hints,
                sampleTestCases: (aiData.sampleInput || aiData.sampleOutput)
                    ? [{ input: aiData.sampleInput || '', expected: aiData.sampleOutput || '' }]
                    : prev.sampleTestCases,
                hiddenTestCases: (aiData.hiddenInput || aiData.hiddenOutput)
                    ? [{ input: aiData.hiddenInput || '', expected: aiData.hiddenOutput || '' }]
                    : prev.hiddenTestCases,
            }));
            toast.success("AI đã tạo xong đề bài và test case!", { id: 'ai' });
        } catch(err) { toast.error("Lỗi AI", { id: 'ai' }); }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải giáo trình...</div>;
    if (!course) return <div style={{ padding: '40px', textAlign: 'center' }}>Không tìm thấy khóa học!</div>;

    const cellStyle = { padding: '12px 16px', borderBottom: '1px solid #e2e8f0', textAlign: 'left' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', margin: '-24px -32px', backgroundColor: '#f8f9fa' }}>
            
            {/* TOP BAR */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/admin/courses')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}>
                        <ArrowLeft size={16}/> Quay lại
                    </button>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Cấu hình giáo trình: <span style={{ color: '#f05123' }}>{course.name}</span></h2>
                </div>
            </div>

            {/* SPLIT PANE */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                
                {/* --- CỘT TRÁI: SYLLABUS TREE --- */}
                <div style={{ width: '380px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Cấu trúc chương trình</h3>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        {course.modules.map((module, mIndex) => (
                            <div key={module.id} style={{ marginBottom: '20px' }}>
                                {/* Chương Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '10px 12px', borderRadius: '6px', fontWeight: 600, fontSize: '14px' }}>
                                    {/* <span>Chương {mIndex + 1}: {module.title}</span> */}
                                    <span>{mIndex + 1}: {module.title}</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleEditModule(module.id, module.title)} style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={14}/></button>
                                        <button onClick={() => handleDeleteModule(module.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash size={14}/></button>
                                    </div>
                                </div>

                                {/* Danh sách Bài học */}
                                <div style={{ paddingLeft: '12px', marginTop: '8px' }}>
                                    {module.lessons.map(lesson => {
                                        const isActive = selectedLessonId === lesson.id;
                                        return (
                                            <div 
                                                key={lesson.id}
                                                onClick={() => { setSelectedModuleId(module.id); setSelectedLessonId(lesson.id); setIsEditingLesson(false); resetProblemForm(); }}
                                                style={{ 
                                                    display: 'flex', alignItems: 'center', padding: '10px 12px', cursor: 'pointer', borderRadius: '6px', marginBottom: '4px', fontSize: '14px',
                                                    backgroundColor: isActive ? '#fef2f2' : 'transparent', color: isActive ? '#f05123' : '#4b5563',
                                                    borderLeft: isActive ? '3px solid #f05123' : '3px solid transparent'
                                                }}>
                                                <span style={{ marginRight: '10px', fontSize: '16px' }}>{lesson.lessonType === 'video' ? '▶' : lesson.lessonType === 'coding' ? '💻' : '📄'}</span>
                                                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isActive ? 600 : 400 }}>{lesson.title}</span>
                                            </div>
                                        );
                                    })}

                                    {/* Form Thêm nhanh Bài học */}
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', paddingLeft: '12px' }}>
                                        <input 
                                            className="form-input" placeholder="Tên bài..." style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                                            onChange={e => { setLessonTitle(e.target.value); setSelectedModuleId(module.id); }}
                                            onKeyDown={e => { if(e.key === 'Enter') { handleAddLesson(); e.target.value = ''; } }}
                                        />
                                        <select className="form-input" style={{ width: '90px', fontSize: '12px', padding: '8px' }} onChange={e => setLessonTypeToCreate(e.target.value)}>
                                            {lessonTypeOptions.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}
                                        </select>
                                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', color: '#f05123', borderColor: '#f05123' }} onClick={e => { handleAddLesson(); e.currentTarget.parentElement.querySelector('input').value = ''; }}>
                                            Thêm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Form Thêm Chương mới */}
                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '2px dashed #e2e8f0' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input className="form-input" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} placeholder="Tên chương mới..." style={{ flex: 1 }} />
                                <button className="btn btn-outline" onClick={handleAddModule}>+ Chương</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: LESSON EDITOR --- */}
                <div style={{ flex: 1, backgroundColor: '#f8fafc', overflowY: 'auto', padding: '32px' }}>
                    {!selectedLesson ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <BookOpen size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <h3 style={{ fontWeight: 500 }}>Chọn một bài học ở cột trái để cấu hình nội dung</h3>
                        </div>
                    ) : (
                        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                            {/* Khung Tiêu đề Bài học */}
                            <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
                                            {selectedLessonTypeLabel}
                                        </span>
                                        
                                        {isEditingLesson ? (
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <input className="form-input" value={lessonEditForm.title} onChange={e => setLessonEditForm(prev => ({ ...prev, title: e.target.value }))} style={{ flex: 1, minWidth: '300px', fontSize: '18px', fontWeight: 700 }} />
                                                <select className="form-input" value={lessonEditForm.lessonType} onChange={e => setLessonEditForm(prev => ({ ...prev, lessonType: e.target.value }))}>
                                                    {lessonTypeOptions.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}
                                                </select>
                                                <button className="btn btn-primary" onClick={handleSaveLessonEdit}>Lưu</button>
                                                <button className="btn btn-outline" onClick={() => setIsEditingLesson(false)}>Hủy</button>
                                            </div>
                                        ) : (
                                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a' }}>
                                                {selectedLesson.title}
                                                <button onClick={() => { setLessonEditForm({ title: selectedLesson.title, lessonType: selectedLesson.lessonType }); setIsEditingLesson(true); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><Edit size={20} /></button>
                                            </h2>
                                        )}
                                    </div>
                                    <button className="btn btn-outline" onClick={handleDeleteLesson} style={{ color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }}>
                                        <Trash size={16} style={{ marginRight: '6px' }} /> Xóa bài
                                    </button>
                                </div>
                            </div>

                            {/* Khung Nội dung tuỳ theo Type */}
                            {selectedLesson.lessonType === 'video' && (
                                <div className="card" style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Link YouTube</h3>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input className="form-input" style={{ flex: 1 }} placeholder="Nhập URL Youtube..." value={selectedLesson.videoUrl || ''} onChange={e => updateSelectedLessonData(l => ({ ...l, videoUrl: e.target.value }))} />
                                        <button className="btn btn-primary" onClick={handleSaveLessonContentToDB}>Lưu URL</button>
                                    </div>
                                    {selectedLesson.videoUrl && (
                                        <div style={{ marginTop: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <iframe src={toEmbedUrl(selectedLesson.videoUrl)} width="100%" height="450" style={{ border: 'none' }} allowFullScreen title="Preview" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {(selectedLesson.lessonType === 'theory' || selectedLesson.lessonType === 'video') && (
                                <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 600 }}>
                                            <FileText size={20} color="#3b82f6" /> Soạn thảo nội dung (Text hiển thị dưới Video/Tiêu đề)
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ fontSize: '13px', color: '#64748b' }}>{lastSavedAt ? `Đã lưu: ${lastSavedAt.toLocaleTimeString()}` : 'Chưa lưu'}</span>
                                            <button className="btn btn-primary" onClick={handleSaveLessonContentToDB}>Lưu nội dung</button>
                                        </div>
                                    </div>
                                    <div style={{ padding: '24px' }}>
                                        <RichTextEditor key={selectedLesson.id} data={selectedLesson.content} onChange={data => updateSelectedLessonData(l => ({ ...l, content: data }))} />
                                    </div>
                                </div>
                            )}

                            {selectedLesson.lessonType === 'coding' && (
                                <div className="card" style={{ padding: '24px' }}>
                                    <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Code2 size={24} color="#f05123" /> Cấu hình đề bài
                                    </h3>
                                    
                                    <form onSubmit={handleSaveProblem}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label className="form-label" style={{ fontWeight: 600 }}>Mô tả đề bài *</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
                                                    <Editor
                                                        height="400px"
                                                        language="markdown"
                                                        theme="vs-light"
                                                        value={problemForm.description}
                                                        onChange={(value) => setProblemForm(prev => ({ ...prev, description: value || '' }))}
                                                        options={{
                                                            minimap: { enabled: false },
                                                            wordWrap: 'on',
                                                            lineNumbers: 'on',
                                                            scrollBeyondLastLine: false,
                                                            fontSize: 14,
                                                            tabSize: 2
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ 
                                                    border: '1px solid #d1d5db', 
                                                    borderRadius: '8px', 
                                                    padding: '16px', 
                                                    height: '400px', 
                                                    overflowY: 'auto',
                                                    backgroundColor: '#fff',
                                                    fontSize: '15px',
                                                    lineHeight: '1.6'
                                                }}>
                                                    {problemForm.description ? (
                                                        <div className="markdown-body">
                                                            <ReactMarkdown>
                                                                {problemForm.description}
                                                            </ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#9ca3af' }}>Bản xem trước sẽ hiển thị ở đây...</span>
                                                    )}
                                                </div>
                                            </div>
                                            {!problemForm.description.trim() && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '6px' }}>Mô tả đề bài là bắt buộc.</div>}
                                        </div>

                                        {/* Khối AI */}
                                        <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '24px' }}>
                                            <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: '8px' }}>🤖 Tạo nhanh bằng AI</div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <input className="form-input" style={{ flex: 1 }} placeholder="VD: Bài tập in ra chuỗi Fibonacci..." value={problemAiPrompt} onChange={e => setProblemAiPrompt(e.target.value)} />
                                                <button type="button" className="btn btn-primary" onClick={handleGenerateProblemWithAI}>Tạo đề</button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                            <div><label className="form-label">Tên bài</label><input className="form-input" value={problemForm.title} onChange={e => setProblemForm(p => ({...p, title: e.target.value}))} required /></div>
                                            <div><label className="form-label">Độ khó</label><select className="form-input" value={problemForm.difficulty} onChange={e => setProblemForm(p => ({...p, difficulty: e.target.value}))}><option value="Easy">Dễ</option><option value="Medium">Trung bình</option><option value="Hard">Khó</option></select></div>
                                            <div><label className="form-label">Ngôn ngữ</label><select className="form-input" value={problemForm.language} onChange={e => setProblemForm(p => ({...p, language: e.target.value}))}>{languageOptions.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}</select></div>
                                            <div><label className="form-label">Giới hạn thời gian (s)</label><input type="number" className="form-input" value={problemForm.timeLimit} onChange={e => setProblemForm(p => ({...p, timeLimit: e.target.value}))} /></div>
                                            <div><label className="form-label">Bộ nhớ (MB)</label><input type="number" className="form-input" value={problemForm.memoryLimit} onChange={e => setProblemForm(p => ({...p, memoryLimit: e.target.value}))} /></div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                            <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <h4 style={{ margin: 0, color: '#16a34a' }}>Sample Test (Học viên thấy)</h4>
                                                    <button type="button" onClick={() => setProblemForm(p => ({...p, sampleTestCases: [...p.sampleTestCases, {input: '', expected: ''}]}))} className="btn" style={{ fontSize: '12px', padding: '4px 8px', border: '1px solid #16a34a', color: '#16a34a', background: 'transparent' }}>+ Thêm</button>
                                                </div>
                                                {(problemForm.sampleTestCases || [{input:'', expected:''}]).map((tc, idx) => (
                                                    <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: idx < (problemForm.sampleTestCases?.length || 1) - 1 ? '1px dashed #cbd5e1' : 'none' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>Test Case #{idx + 1}</label>
                                                            {(problemForm.sampleTestCases?.length || 0) > 1 && <button type="button" onClick={() => setProblemForm(p => ({...p, sampleTestCases: p.sampleTestCases.filter((_, i) => i !== idx)}))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', padding: 0 }}>Xóa</button>}
                                                        </div>
                                                        <textarea className="form-input" rows={2} placeholder="Input" value={tc.input} onChange={e => setProblemForm(p => { const newTc = [...p.sampleTestCases]; newTc[idx].input = e.target.value; return {...p, sampleTestCases: newTc}; })} style={{ marginBottom: '8px', fontFamily: 'monospace' }} />
                                                        <textarea className="form-input" rows={2} placeholder="Output mong đợi" value={tc.expected} onChange={e => setProblemForm(p => { const newTc = [...p.sampleTestCases]; newTc[idx].expected = e.target.value; return {...p, sampleTestCases: newTc}; })} style={{ fontFamily: 'monospace' }} />
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <h4 style={{ margin: 0, color: '#ea580c' }}>Hidden Test (Testcase ẩn)</h4>
                                                    <button type="button" onClick={() => setProblemForm(p => ({...p, hiddenTestCases: [...p.hiddenTestCases, {input: '', expected: ''}]}))} className="btn" style={{ fontSize: '12px', padding: '4px 8px', border: '1px solid #ea580c', color: '#ea580c', background: 'transparent' }}>+ Thêm</button>
                                                </div>
                                                {(problemForm.hiddenTestCases || [{input:'', expected:''}]).map((tc, idx) => (
                                                    <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: idx < (problemForm.hiddenTestCases?.length || 1) - 1 ? '1px dashed #cbd5e1' : 'none' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>Test Case #{idx + 1}</label>
                                                            {(problemForm.hiddenTestCases?.length || 0) > 1 && <button type="button" onClick={() => setProblemForm(p => ({...p, hiddenTestCases: p.hiddenTestCases.filter((_, i) => i !== idx)}))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', padding: 0 }}>Xóa</button>}
                                                        </div>
                                                        <textarea className="form-input" rows={2} placeholder="Input" value={tc.input} onChange={e => setProblemForm(p => { const newTc = [...p.hiddenTestCases]; newTc[idx].input = e.target.value; return {...p, hiddenTestCases: newTc}; })} style={{ marginBottom: '8px', fontFamily: 'monospace' }} />
                                                        <textarea className="form-input" rows={2} placeholder="Output mong đợi" value={tc.expected} onChange={e => setProblemForm(p => { const newTc = [...p.hiddenTestCases]; newTc[idx].expected = e.target.value; return {...p, hiddenTestCases: newTc}; })} style={{ fontFamily: 'monospace' }} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Code khởi đầu */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#555' }}>Code khởi đầu (Template cho học viên)</div>
                                            <label className="form-label" style={{ fontSize: '13px' }}>
                                                {languageOptions.find((item) => item.key === problemForm.language)?.label || ''} - Code mẫu ban đầu
                                            </label>
                                            <textarea
                                                className="form-input"
                                                rows={8}
                                                style={{ fontFamily: 'var(--font-code)', fontSize: '13px', backgroundColor: '#fafafa' }}
                                                value={problemForm.starterCode}
                                                onChange={(e) => setProblemForm((prev) => ({ ...prev, starterCode: e.target.value }))}
                                                placeholder={problemForm.language === 'java' ? 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Code của bạn ở đây\n    }\n}' : problemForm.language === 'python' ? '# Nhập code của bạn ở đây\n\n' : '// Nhập code của bạn ở đây\n\n'}
                                            />
                                            {problemForm.starterCode && (
                                                <div style={{ marginTop: '10px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#555' }}>Preview:</div>
                                                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#0f172a', padding: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                                                        <pre
                                                            style={{ margin: 0, fontFamily: 'var(--font-code)', fontSize: '13px', lineHeight: 1.6, color: '#e2e8f0' }}
                                                            dangerouslySetInnerHTML={{ __html: highlightCodeByLanguage(problemForm.language, problemForm.starterCode) }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Gợi ý / Ghi chú */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#555' }}>Gợi ý / Ghi chú (tùy chọn)</div>
                                            <label className="form-label" style={{ fontSize: '13px' }}>Gợi ý giúp học viên giải bài</label>
                                            <textarea
                                                className="form-input"
                                                rows={4}
                                                style={{ resize: 'vertical' }}
                                                value={problemForm.hints}
                                                onChange={(e) => setProblemForm((prev) => ({ ...prev, hints: e.target.value }))}
                                                placeholder="VD: - Sử dụng Scanner để đọc input&#10;- Chú ý xử lý trường hợp số âm&#10;- Kết quả có thể lớn, cần dùng kiểu long"
                                            />
                                        </div>

                                        {/* Solution Code */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#555' }}>Lời giải (Code mẫu chuẩn)</div>
                                            <label className="form-label" style={{ fontSize: '13px' }}>
                                                {languageOptions.find((item) => item.key === problemForm.language)?.label || ''} - Đáp án chuẩn để chấm bài
                                            </label>
                                            <textarea
                                                className="form-input"
                                                rows={10}
                                                style={{ fontFamily: 'var(--font-code)', fontSize: '13px', backgroundColor: '#fafafa' }}
                                                value={problemForm.solutionCode}
                                                onChange={(e) => setProblemForm((prev) => ({ ...prev, solutionCode: e.target.value }))}
                                                placeholder="// Nhập code lời giải chuẩn tại đây..."
                                            />
                                            {problemForm.solutionCode && (
                                                <div style={{ marginTop: '10px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#555' }}>Preview với syntax highlighting:</div>
                                                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#0f172a', padding: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                                                        <pre
                                                            style={{ margin: 0, fontFamily: 'var(--font-code)', fontSize: '13px', lineHeight: 1.6, color: '#e2e8f0' }}
                                                            dangerouslySetInnerHTML={{ __html: highlightCodeByLanguage(problemForm.language, problemForm.solutionCode) }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                            <button type="submit" className="btn btn-primary">{editingProblemId ? 'Cập nhật Bài tập' : 'Lưu Bài tập mới'}</button>
                                            {editingProblemId && <button type="button" className="btn btn-outline" onClick={resetProblemForm}>Hủy</button>}
                                        </div>
                                    </form>

                                    {/* Bảng danh sách bài tập */}
                                    <div style={{ marginTop: '32px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Danh sách bài tập của bài học này</h3>
                                        {problems.length === 0 ? (
                                            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#94a3b8' }}>Chưa có bài tập nào.</div>
                                        ) : (
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                                                        <th style={cellStyle}>Tên bài</th>
                                                        <th style={{ ...cellStyle, textAlign: 'center' }}>Độ khó</th>
                                                        <th style={{ ...cellStyle, textAlign: 'right' }}>Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {problems.map(prob => (
                                                        <tr key={prob.id}>
                                                            <td style={cellStyle}><b>{prob.title}</b></td>
                                                            <td style={{ ...cellStyle, textAlign: 'center' }}>
                                                                <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, backgroundColor: prob.difficulty === 'Easy' ? '#dcfce7' : prob.difficulty === 'Medium' ? '#fef3c7' : '#fee2e2', color: prob.difficulty === 'Easy' ? '#16a34a' : prob.difficulty === 'Medium' ? '#d97706' : '#dc2626' }}>
                                                                    {prob.difficulty}
                                                                </span>
                                                            </td>
                                                            <td style={{ ...cellStyle, textAlign: 'right' }}>
                                                                <button onClick={() => { setEditingProblemId(prob.id); setProblemForm(toProblemForm(prob)); setProblemAiPrompt(''); }} style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '16px' }}><Edit size={16}/></button>
                                                                <button onClick={() => {
                                                                    setConfirmConfig({
                                                                        isOpen: true,
                                                                        message: 'Xóa bài tập này?',
                                                                        onConfirm: async () => {
                                                                            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                                                                            await deleteProblem(prob.id); 
                                                                            setProblems(prev => prev.filter(p => p.id !== prob.id)); 
                                                                            toast.success('Đã xóa!');
                                                                        }
                                                                    });
                                                                }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash size={16}/></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
            
            <ConfirmDialog 
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

