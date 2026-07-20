import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Users, BookOpen, Settings, BarChart2, Edit, Trash, FileText, Code2, Menu } from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import '../../styles/f8-theme.css';
import { toast } from 'sonner';
import axios from 'axios';

import { RichTextEditor } from '../components/admin/RichTextEditor';
import ConfirmDialog from '../components/ui/ConfirmDialog';

import { 
    getAdminCourses, createCourse, updateCourse, deleteCourse, 
    createChapter, updateChapter, deleteChapter, 
    createLesson, updateLessonContent, deleteLesson,
    getProblemsByLessonId, createProblem, updateProblem, deleteProblem,
    generateProblemWithAI
} from '../../../services/admin.service';

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
    <button
        type="button"
        onClick={onClick}
        title={label}
        style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '12px' : '12px 16px',
            borderRadius: '8px',
            backgroundColor: active ? '#e8ebed' : 'transparent',
            color: active ? '#1a1a1a' : '#404040',
            marginBottom: '8px',
            fontWeight: active ? 600 : 500,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
        }}>
        <Icon size={20} style={{ marginRight: collapsed ? 0 : '12px' }} />
        {!collapsed && label}
    </button>
);

const cellStyle = {
    padding: '14px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #eee'
};

const emptySnippets = {
    c: '',
    csharp: '',
    java: '',
    nodejs: ''
};

const languageOptions = [
    { key: 'c', label: 'C' },
    { key: 'csharp', label: 'C#' },
    { key: 'java', label: 'Java' },
    { key: 'nodejs', label: 'NodeJS' }
];

const lessonTypeOptions = [
    { key: 'theory', label: 'Lý thuyết / Soạn thảo' },
    { key: 'video', label: 'Video' },
    { key: 'coding', label: 'Coding' }
];

const escapeHtml = (value = '') =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const unescapeHtml = (value = '') =>
    value
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');

const stripHtml = (value = '') =>
    value
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

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
    if (keywords.length === 0) {
        return escaped
            .replace(/(\/\/.*)$/gm, '<span style="color:#64748b;">$1</span>')
            .replace(/(".*?"|'.*?')/g, '<span style="color:#16a34a;">$1</span>');
    }
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    return escaped
        .replace(/(\/\/.*)$/gm, '<span style="color:#64748b;">$1</span>')
        .replace(/(".*?"|'.*?')/g, '<span style="color:#16a34a;">$1</span>')
        .replace(keywordRegex, '<span style="color:#7c3aed;font-weight:600;">$1</span>');
};

const toEmbedUrl = (url = '') => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
        return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
        return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
};

export const AdminDashboard = () => {
    const [activeMenu, setActiveMenu] = useState('courses');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [problems, setProblems] = useState([]);
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: 'Xác nhận', message: '', onConfirm: () => {} });

    const [problemForm, setProblemForm] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        language: 'java',
        timeLimit: 1,
        memoryLimit: 128,
        starterCode: '',
        solutionCode: '',
        hints: '',
        sampleInput: '',
        sampleOutput: '',
        hiddenInput: '',
        hiddenOutput: ''
    });
    const [editingProblemId, setEditingProblemId] = useState(null);

    const [users, setUsers] = useState([
        { id: 1, name: 'Nguyễn Văn A', email: 'a@student.edu.vn', status: 'active' },
        { id: 2, name: 'Trần Thị B', email: 'b@student.edu.vn', status: 'locked' },
        { id: 3, name: 'Lê Văn C', email: 'c@student.edu.vn', status: 'active' }
    ]);
    const [selectedUserForProgress, setSelectedUserForProgress] = useState(null);
    const [showUserProgressModal, setShowUserProgressModal] = useState(false);

    // Dữ liệu tiến độ học tập mẫu
    const userProgressData = {
        1: {
            enrolledCourses: [
                { courseId: 1, courseName: 'ReactJS Masterclass', progress: 65, completedLessons: 13, totalLessons: 20, lastAccessed: '2026-02-25', avgScore: 85 },
            ],
            totalSubmissions: 45,
            totalProblemsCompleted: 12,
            totalStudyTime: 156, // hours
            lastActivity: '2026-02-25 14:30',
            joinedDate: '2025-09-01'
        },
        2: {
            enrolledCourses: [
                { courseId: 1, courseName: 'ReactJS Masterclass', progress: 30, completedLessons: 6, totalLessons: 20, lastAccessed: '2026-02-20', avgScore: 72 },
            ],
            totalSubmissions: 18,
            totalProblemsCompleted: 5,
            totalStudyTime: 42,
            lastActivity: '2026-02-20 09:15',
            joinedDate: '2025-10-15'
        },
        3: {
            enrolledCourses: [
                { courseId: 1, courseName: 'ReactJS Masterclass', progress: 90, completedLessons: 18, totalLessons: 20, lastAccessed: '2026-02-26', avgScore: 92 },
            ],
            totalSubmissions: 82,
            totalProblemsCompleted: 18,
            totalStudyTime: 210,
            lastActivity: '2026-02-26 10:45',
            joinedDate: '2025-08-20'
        }
    };

    const [courses, setCourses] = useState([]);
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await getAdminCourses();
                
                // BƯỚC MAP DỮ LIỆU THẦN THÁNH: 
                // Biến đổi _id của MongoDB thành id để giao diện không bị lỗi
                const formattedCourses = res.data.map(course => ({
                    ...course,
                    id: course._id, // Map ID
                    name: course.title,
                    modules: course.modules.map(module => ({
                        ...module,
                        id: module._id,
                        lessons: module.lessons.map(lesson => ({
                            ...lesson,
                            id: lesson._id,
                            lessonType: lesson.type || 'theory' // Map chữ type thành lessonType
                        }))
                    }))
                }));

                setCourses(formattedCourses);

                // Tự động chọn khóa học đầu tiên khi load xong
                if (formattedCourses.length > 0) {
                    setSelectedCourseId(formattedCourses[0].id);
                    if (formattedCourses[0].modules.length > 0) {
                        setSelectedModuleId(formattedCourses[0].modules[0].id);
                        if (formattedCourses[0].modules[0].lessons.length > 0) {
                            setSelectedLessonId(formattedCourses[0].modules[0].lessons[0].id);
                        }
                    }
                }
            } catch (error) {
                toast.error("Không thể tải dữ liệu từ server.");
            }
        };

        fetchCourses();
    }, []); // Chạy 1 lần duy nhất khi load trang

    const [courseForm, setCourseForm] = useState({ name: '', price: '', description: '' });
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [showAddCourseModal, setShowAddCourseModal] = useState(false);

    const [selectedCourseId, setSelectedCourseId] = useState(1);
    const [selectedModuleId, setSelectedModuleId] = useState(11);
    const [selectedLessonId, setSelectedLessonId] = useState(111);
    const [showCurriculumEditor, setShowCurriculumEditor] = useState(false);
    const [moduleTitle, setModuleTitle] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonTypeToCreate, setLessonTypeToCreate] = useState('theory');
    const [isEditingLesson, setIsEditingLesson] = useState(false);
    const [lessonEditForm, setLessonEditForm] = useState({ title: '', lessonType: 'theory' });
    const [challengeToAttach, setChallengeToAttach] = useState('');

    const [editorMode, setEditorMode] = useState('gitbook');
    const [problemAiPrompt, setProblemAiPrompt] = useState('');
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [dashboardRange, setDashboardRange] = useState('month');
    const [dashboardDate, setDashboardDate] = useState(new Date().toISOString().slice(0, 10));

    const [settings, setSettings] = useState({
        siteName: 'Learning Platform',
        siteDescription: 'Nền tảng học lập trình trực tuyến',
        adminEmail: 'admin@learning.vn',
        allowRegistration: true,
        emailNotifications: true,
        autoApproveUsers: false,
        maxUploadSize: 10,
        defaultCodeTimeout: 5,
        defaultMemoryLimit: 256,
        enableAI: true,
        maintenanceMode: false,
        showLeaderboard: true,
        theme: 'light'
    });
    const [settingsChanged, setSettingsChanged] = useState(false);

    const selectedCourse = useMemo(
        () => courses.find((course) => course.id === selectedCourseId) || null,
        [courses, selectedCourseId]
    );

    const selectedModule = useMemo(
        () => selectedCourse?.modules.find((module) => module.id === selectedModuleId) || null,
        [selectedCourse, selectedModuleId]
    );

    const selectedLesson = useMemo(
        () => selectedModule?.lessons.find((lesson) => lesson.id === selectedLessonId) || null,
        [selectedModule, selectedLessonId]
    );

    useEffect(() => {
        const fetchProblems = async () => {
            if (selectedLesson && selectedLesson.lessonType === 'coding') {
                try {
                    const res = await getProblemsByLessonId(selectedLesson.id);
                    // 🚀 Lấy đúng ruột data (phòng trường hợp API bọc trong res.data.data)
                    const problemList = res.data.data || res.data || [];
                    
                    // Map lại ID cho khớp UI
                    const formattedProblems = problemList.map(p => ({ ...p, id: p._id }));
                    setProblems(formattedProblems);
                } catch (error) {
                    setProblems([]);
                }
            }
        };
        fetchProblems();
    }, [selectedLessonId, selectedLesson]);
    
    const dashboardSeries = useMemo(() => {
        const anchorDate = dashboardDate ? new Date(dashboardDate) : new Date();
        const monthLabels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

        const createPoint = (label, index) => {
            const base = (index + 3) * 7;
            return {
                label,
                activeUsers: 40 + (base % 60),
                submissions: 30 + ((base * 2) % 90),
                solved: 20 + ((base * 3) % 70)
            };
        };

        if (dashboardRange === 'day') {
            return Array.from({ length: 8 }, (_, i) => createPoint(`${i * 3}:00`, i));
        }

        if (dashboardRange === 'week') {
            const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
            return dayLabels.map((label, index) => createPoint(label, index));
        }

        if (dashboardRange === 'year') {
            return monthLabels.map((label, index) => createPoint(label, index));
        }

        const daysInMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0).getDate();
        const weeklyBuckets = Math.ceil(daysInMonth / 7);
        return Array.from({ length: weeklyBuckets }, (_, index) => createPoint(`Tuần ${index + 1}`, index));
    }, [dashboardRange, dashboardDate]);

    const difficultyData = useMemo(() => {
        const counts = problems.reduce(
            (acc, item) => {
                const key = (item.difficulty || '').toLowerCase();
                if (key === 'easy') acc.easy += 1;
                if (key === 'medium') acc.medium += 1;
                if (key === 'hard') acc.hard += 1;
                return acc;
            },
            { easy: 0, medium: 0, hard: 0 }
        );

        return [
            { name: 'Easy', value: counts.easy, color: '#22c55e' },
            { name: 'Medium', value: counts.medium, color: '#f59e0b' },
            { name: 'Hard', value: counts.hard, color: '#ef4444' }
        ];
    }, [problems]);

    const selectedLessonProblems = useMemo(
        () => problems.filter((problem) => problem.linkedLessonId === selectedLesson?.id),
        [problems, selectedLesson?.id]
    );

    const selectedLessonTypeLabel = useMemo(
        () => lessonTypeOptions.find((item) => item.key === (selectedLesson?.lessonType || 'theory'))?.label || 'Lý thuyết / Soạn thảo',
        [selectedLesson?.lessonType]
    );

    const updateSelectedLesson = (updater) => {
        if (!selectedCourse || !selectedModule || !selectedLesson) return;

        setCourses((prev) =>
            prev.map((course) =>
                course.id === selectedCourse.id
                    ? {
                            ...course,
                            modules: course.modules.map((module) =>
                                module.id === selectedModule.id
                                    ? {
                                            ...module,
                                            lessons: module.lessons.map((lesson) => (lesson.id === selectedLesson.id ? updater(lesson) : lesson))
                                        }
                                    : module
                            )
                        }
                    : course
            )
        );

        setLastSavedAt(new Date());
    };

    const resetProblemForm = () => {
        setProblemForm({
            title: '',
            difficulty: 'Easy',
            language: 'java',
            timeLimit: 1,
            memoryLimit: 128,
            solutionCode: '',
            sampleInput: '',
            sampleOutput: '',
            hiddenInput: '',
            hiddenOutput: ''
        });
        setEditingProblemId(null);
    };

    const handleSaveProblem = async (e) => {
        e.preventDefault();
        if (!problemForm.title.trim()) return;

        const payload = {
            ...problemForm,
            timeLimit: Number(problemForm.timeLimit),
            memoryLimit: Number(problemForm.memoryLimit),
            linkedCourseId: selectedCourse?.id || null,
            linkedModuleId: selectedModule?.id || null,
            linkedLessonId: selectedLesson?.id || null,
            lessonId: selectedLesson?.id || null // 🚀 Đề phòng Backend dùng chữ lessonId
        };

        toast.loading('Đang lưu bài tập...', { id: 'save-problem' });
        try {
            if (editingProblemId) {
                const res = await updateProblem(editingProblemId, payload);
                // 🚀 Lấy đúng ruột bài tập từ API trả về
                const updatedProblem = res.data.data || res.data; 
                
                setProblems((prev) => prev.map((item) => (item.id === editingProblemId ? { ...updatedProblem, id: updatedProblem._id } : item)));
                toast.success('Cập nhật thành công!', { id: 'save-problem' });
            } else {
                const res = await createProblem(payload);
                // 🚀 Lấy đúng ruột bài tập từ API trả về
                const newProblem = res.data.data || res.data; 
                
                setProblems((prev) => [...prev, { ...newProblem, id: newProblem._id }]);
                toast.success('Tạo bài tập thành công!', { id: 'save-problem' });
            }
            resetProblemForm();
        } catch (error) {
            toast.error('Lỗi khi lưu bài tập.', { id: 'save-problem' });
        }
    };

// 1. LƯU KHÓA HỌC MỚI VÀO DB
    const handleSaveCourse = async (e) => {
        e.preventDefault();
        if (!courseForm.name.trim()) return;

        try {
            if (editingCourseId) {
                toast.loading('Đang cập nhật khóa học...', { id: 'save-course' });
                await updateCourse(editingCourseId, {
                    title: courseForm.name,
                    description: courseForm.description,
                    price: courseForm.price || 0
                });

                setCourses((prev) => prev.map((course) => 
                    course.id === editingCourseId 
                    ? { ...course, name: courseForm.name, description: courseForm.description, price: courseForm.price } 
                    : course
                ));
                toast.success('Cập nhật khóa học thành công!', { id: 'save-course' });
            } else {
                toast.loading('Đang tạo khóa học...', { id: 'create-course' });
                
                // Gọi API POST tạo khóa học
                const res = await createCourse({
                    title: courseForm.name,
                    description: courseForm.description,
                    price: courseForm.price || 0
                });
                
                // Đưa data có ID thật từ MongoDB lên giao diện
                const newCourse = {
                    ...res.data,
                    id: res.data._id,
                    name: res.data.title,
                    modules: []
                };
                
                setCourses((prev) => [newCourse, ...prev]);
                setSelectedCourseId(newCourse.id);
                toast.success('Tạo khóa học thành công!', { id: 'create-course' });
            }
            setCourseForm({ name: '', price: '', description: '' });
            setShowAddCourseModal(false);
            setEditingCourseId(null);
        } catch (error) {
            toast.error('Lỗi khi tạo khóa học.', { id: 'create-course' });
        }
    };

    // HÀM XÓA KHÓA HỌC
    const handleDeleteCourse = (courseId) => {
        setConfirmConfig({
            isOpen: true,
            message: 'CẢNH BÁO: Xóa khóa học sẽ XÓA SẠCH toàn bộ Chương, Bài học và Bài tập bên trong. Bác chắc chắn chứ?',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                toast.loading('Đang xóa khóa học...', { id: 'delete-course' });
                try {
                    await deleteCourse(courseId);
                    
                    setCourses((prev) => prev.filter((item) => item.id !== courseId));
                    toast.success('Đã xóa khóa học vĩnh viễn!', { id: 'delete-course' });
                } catch (error) {
                    toast.error('Lỗi khi xóa khóa học.', { id: 'delete-course' });
                }
            }
        });
    };

    // 2. LƯU CHƯƠNG MỚI VÀO DB
    const handleAddModule = async () => {
        if (!selectedCourse || !moduleTitle.trim()) return;
        toast.loading('Đang thêm chương...', { id: 'add-module' });
        
        try {
            // Gọi API POST tạo chương
            const res = await createChapter(selectedCourse.id, {
                title: moduleTitle,
                order: selectedCourse.modules.length + 1
            });

            const newModule = { ...res.data, id: res.data._id, lessons: [] };
            
            setCourses((prev) =>
                prev.map((course) => (course.id === selectedCourse.id ? { ...course, modules: [...course.modules, newModule] } : course))
            );
            setSelectedModuleId(newModule.id);
            setModuleTitle('');
            toast.success('Đã thêm chương thành công!', { id: 'add-module' });
        } catch(err) {
            toast.error('Lỗi khi thêm chương.', { id: 'add-module' });
        }
    };

    // 3. LƯU BÀI HỌC MỚI VÀO DB
    const handleAddLesson = async () => {
        if (!selectedCourse || !selectedModule || !lessonTitle.trim()) return;
        toast.loading('Đang thêm bài học...', { id: 'add-lesson' });

        try {
            // Gọi API POST tạo bài học
            const res = await createLesson(selectedModule.id, {
                title: lessonTitle,
                type: lessonTypeToCreate,
                order: selectedModule.lessons.length + 1
            });

            const newLesson = { 
                ...res.data, 
                id: res.data._id, 
                lessonType: res.data.type || 'theory'
            };

            setCourses((prev) =>
                prev.map((course) =>
                    course.id === selectedCourse.id
                        ? {
                              ...course,
                              modules: course.modules.map((module) =>
                                  module.id === selectedModule.id ? { ...module, lessons: [...module.lessons, newLesson] } : module
                              )
                          }
                        : course
                )
            );
            setSelectedLessonId(newLesson.id);
            setLessonTitle('');
            toast.success('Đã thêm bài học thành công!', { id: 'add-lesson' });
        } catch(err) {
            toast.error('Lỗi khi thêm bài học.', { id: 'add-lesson' });
        }
    };

    // 1. SỬA TÊN CHƯƠNG (Có gọi API)
    const handleEditModule = async (moduleId, currentTitle) => {
        if (!selectedCourseId) return;
        const nextTitle = window.prompt('Nhập tên chương mới:', currentTitle);
        if (!nextTitle || !nextTitle.trim() || nextTitle.trim() === currentTitle) return;

        toast.loading('Đang cập nhật...', { id: 'edit-module' });
        try {
            await updateChapter(moduleId, { title: nextTitle.trim() });

            setCourses((prev) =>
                prev.map((course) => course.id === selectedCourseId ? { ...course, modules: course.modules.map((module) => module.id === moduleId ? { ...module, title: nextTitle.trim() } : module) } : course)
            );
            toast.success('Đã cập nhật tên chương!', { id: 'edit-module' });
        } catch (error) {
            console.error("Lỗi sửa chương:", error);
            toast.error('Lỗi lưu DB.', { id: 'edit-module' });
        }
    };

    // 2. XÓA CHƯƠNG (Có gọi API)
    const handleDeleteModule = (moduleId) => {
        if (!selectedCourseId) return;
        setConfirmConfig({
            isOpen: true,
            message: 'CẢNH BÁO: Bạn có chắc chắn muốn xóa chương này và toàn bộ bài học bên trong?',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                toast.loading('Đang xóa chương...', { id: 'delete-module' });
                try {
                    await deleteChapter(moduleId);

                    const nextModules = selectedCourse?.modules.filter((module) => module.id !== moduleId) || [];
                    setCourses((prev) => prev.map((course) => course.id === selectedCourseId ? { ...course, modules: course.modules.filter((module) => module.id !== moduleId) } : course));

                    if (selectedModuleId === moduleId) {
                        setSelectedModuleId(nextModules[0]?.id || null);
                        setSelectedLessonId(nextModules[0]?.lessons?.[0]?.id || null);
                    }
                    toast.success('Đã xóa chương thành công!', { id: 'delete-module' });
                } catch (error) {
                    console.error("Lỗi xóa chương:", error);
                    toast.error('Lỗi DB.', { id: 'delete-module' });
                }
            }
        });
    };

    const handleEditLesson = () => {
        if (!selectedLesson) return;
        setLessonEditForm({
            title: selectedLesson.title || '',
            lessonType: selectedLesson.lessonType || 'theory'
        });
        setIsEditingLesson(true);
    };

    // 1. SỬA TÊN VÀ LOẠI BÀI HỌC
    const handleSaveLessonEdit = async () => {
        if (!selectedLesson || !lessonEditForm.title.trim()) return;

        toast.loading('Đang cập nhật bài học...', { id: 'edit-lesson' });
        try {
            // 🚀 Sử dụng updateLessonContent đã import
            await updateLessonContent(selectedLesson.id, {
                title: lessonEditForm.title.trim(),
                type: lessonEditForm.lessonType || 'theory' 
            });

            updateSelectedLesson((lesson) => ({ ...lesson, title: lessonEditForm.title.trim(), lessonType: lessonEditForm.lessonType || 'theory' }));
            setIsEditingLesson(false);
            toast.success('Cập nhật bài học thành công!', { id: 'edit-lesson' });
        } catch (error) {
            console.error(error);
            toast.error('Lỗi lưu DB. Bác nhớ mở comment code API khi đã có route nhé!', { id: 'edit-lesson' });
            
            // Tạm thời cho phép lưu UI để test
            updateSelectedLesson((lesson) => ({ ...lesson, title: lessonEditForm.title.trim(), lessonType: lessonEditForm.lessonType || 'theory' }));
            setIsEditingLesson(false);
        }
    };

    // 2. XÓA BÀI HỌC
    const handleDeleteLesson = () => {
        if (!selectedCourse || !selectedModule || !selectedLesson) return;
        setConfirmConfig({
            isOpen: true,
            message: 'CẢNH BÁO: Xóa bài học này sẽ xóa luôn TOÀN BỘ Bài tập (Problem) bên trong. Bác có chắc chắn không?',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                toast.loading('Đang xóa bài học...', { id: 'delete-lesson' });
                try {
                    await deleteLesson(selectedLesson.id);

                    const nextLessons = selectedModule.lessons.filter((lesson) => lesson.id !== selectedLesson.id);
                    setCourses((prev) => prev.map((course) => course.id === selectedCourse.id ? { ...course, modules: course.modules.map((module) => module.id === selectedModule.id ? { ...module, lessons: nextLessons } : module) } : course));

                    setSelectedLessonId(nextLessons[0]?.id || 0);
                    setIsEditingLesson(false);
                    toast.success('Đã xóa bài học thành công!', { id: 'delete-lesson' });
                } catch (error) {
                    console.error("Lỗi xóa bài học:", error);
                    toast.error('Lỗi DB.', { id: 'delete-lesson' });
                }
            }
        });
    };

    const handleGenerateProblemWithAI = async () => {
        if (!problemAiPrompt.trim()) {
            toast.error("Vui lòng nhập yêu cầu đề bài cho AI!");
            return;
        }

        toast.loading("AI đang suy nghĩ và soạn đề bài...", { id: 'ai-gen' });
        try {
            const response = await generateProblemWithAI({
                prompt: problemAiPrompt,
                language: problemForm.language
            });

            const aiData = response.data.data;

            // Đổ dữ liệu AI trả về vào Form
            setProblemForm(prev => ({
                ...prev,
                title: aiData.title || prev.title,
                description: aiData.description || prev.description,
                sampleInput: aiData.sampleInput || prev.sampleInput,
                sampleOutput: aiData.sampleOutput || prev.sampleOutput,
                hiddenInput: aiData.hiddenInput || prev.hiddenInput,
                hiddenOutput: aiData.hiddenOutput || prev.hiddenOutput,
                starterCode: aiData.starterCode || prev.starterCode,
                solutionCode: aiData.solutionCode || prev.solutionCode,
                hints: aiData.hints || prev.hints
            }));
            
            toast.success("AI đã tạo xong đề bài!", { id: 'ai-gen' });
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi gọi AI.", { id: 'ai-gen' });
        }
    };

    const handleAttachChallenge = () => {
        if (!selectedLesson || !challengeToAttach) return;
        const challengeId = Number(challengeToAttach);
        const currentChallengeIds = Array.isArray(selectedLesson.challengeIds) ? selectedLesson.challengeIds : [];
        if (currentChallengeIds.includes(challengeId)) {
            setChallengeToAttach('');
            return;
        }

        updateSelectedLesson((lesson) => ({
            ...lesson,
            challengeIds: [...(Array.isArray(lesson.challengeIds) ? lesson.challengeIds : []), challengeId]
        }));
        setChallengeToAttach('');
    };

    const handleUploadMaterials = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        updateSelectedLesson((lesson) => ({
            ...lesson,
            materials: [
                ...(lesson.materials || []),
                ...files.map((file) => ({ id: Date.now() + Math.random(), name: file.name, size: file.size, type: file.type || 'file' }))
            ]
        }));
        e.target.value = '';
    };

    const currentTitle = {
        dashboard: 'Tổng quan quản trị',
        problems: 'Quản lý bài tập',
        users: 'Quản lý người dùng',
        courses: 'Quản lý khóa học',
        settings: 'Cài đặt'
    }[activeMenu];

    // Hàm gọi API lưu nội dung bài học xuống Database
    const handleSaveLessonContentToDB = async () => {
        if (!selectedLesson) return;

        // Tạm thời hiển thị loading
        toast.loading('Đang lưu bài giảng...', { id: 'save-lesson' });

        try {
            // Giả sử selectedLesson.id lúc này đang là cái Object _id thật của MongoDB
            // (Hiện tại đang là ID giả nên nó sẽ gọi API lỗi 404/CastError, 
            // nhưng code này đã sẵn sàng để chạy thật ở bước sau)
            const payload = {
                title: selectedLesson.title,
                content: selectedLesson.content, // Cục JSON của Editor.js
                videoUrl: selectedLesson.videoUrl
            };

            await updateLessonContent(selectedLesson.id, payload);
            
            setLastSavedAt(new Date());
            toast.success('Lưu bài giảng thành công!', { id: 'save-lesson' });
        } catch (error) {
            toast.error('Lỗi khi lưu bài giảng. Kiểm tra console.', { id: 'save-lesson' });
        }
    };

    return (
        <div className="dashboard-container" style={{ width: '100%', padding: '20px 0' }}>
             <aside
                 className="sidebar-desktop"
                 style={{
                         width: sidebarCollapsed ? '76px' : '240px',
                         flexShrink: 0,
                     paddingRight: '8px',
                         transition: 'width 0.2s ease'
                 }}>
                    <div
                        style={{
                                padding: sidebarCollapsed ? '0 8px 16px' : '0 16px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                                gap: '8px'
                        }}>
                        {!sidebarCollapsed && (
                            <span
                                style={{
                                        fontSize: '12px',
                                        color: '#888',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden'
                                }}>
                                Quản trị viên
                            </span>
                        )}

                        <button
                            type="button"
                            title="Thu gọn / mở rộng menu"
                            onClick={() => setSidebarCollapsed((prev) => !prev)}
                            style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    border: '1px solid #d0d0d0',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    color: '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                            }}>
                            <Menu size={16} />
                        </button>
                    </div>
          <nav>
                                                <SidebarItem icon={BarChart2} label="Thống kê" active={activeMenu === 'dashboard'} onClick={() => setActiveMenu('dashboard')} collapsed={sidebarCollapsed} />
                                                <SidebarItem icon={Users} label="Người dùng" active={activeMenu === 'users'} onClick={() => setActiveMenu('users')} collapsed={sidebarCollapsed} />
                                                <SidebarItem icon={BookOpen} label="Khóa học" active={activeMenu === 'courses'} onClick={() => setActiveMenu('courses')} collapsed={sidebarCollapsed} />
                                                <SidebarItem icon={Settings} label="Cài đặt" active={activeMenu === 'settings'} onClick={() => setActiveMenu('settings')} collapsed={sidebarCollapsed} />
          </nav>
       </aside>

       <main style={{ flex: 1 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{currentTitle}</h1>
                                {activeMenu === 'courses' && (
                                    <button className="btn btn-primary" style={{ borderRadius: '20px' }} onClick={() => {
                                        setCourseForm({ name: '', price: '', description: '' });
                                        setEditingCourseId(null);
                                        setShowAddCourseModal(true);
                                    }}>
                                        + Thêm khóa học
                                    </button>
                                )}
           </div>

                     {activeMenu === 'dashboard' && (
                        <div className="card" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {[
                                        { key: 'day', label: 'Ngày' },
                                        { key: 'week', label: 'Tuần' },
                                        { key: 'month', label: 'Tháng' },
                                        { key: 'year', label: 'Năm' }
                                    ].map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            className="btn"
                                            onClick={() => setDashboardRange(item.key)}
                                            style={{
                                                border: '1px solid #ddd',
                                                backgroundColor: dashboardRange === item.key ? 'var(--primary-color)' : '#fff',
                                                color: dashboardRange === item.key ? '#fff' : '#222',
                                                padding: '8px 12px'
                                            }}>
                                            {item.label}
                                        </button>
                                    ))}
                                </div>

                                <input
                                    type="date"
                                    className="form-input"
                                    value={dashboardDate}
                                    onChange={(e) => setDashboardDate(e.target.value)}
                                    style={{ width: '200px' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                <div className="card" style={{ padding: '12px', boxShadow: 'none', border: '1px solid #eee' }}>
                                    <div style={{ fontSize: '13px', color: '#777' }}>Tổng bài tập</div>
                                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{problems.length}</div>
                                </div>
                                <div className="card" style={{ padding: '12px', boxShadow: 'none', border: '1px solid #eee' }}>
                                    <div style={{ fontSize: '13px', color: '#777' }}>Tổng sinh viên</div>
                                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{users.length}</div>
                                </div>
                                <div className="card" style={{ padding: '12px', boxShadow: 'none', border: '1px solid #eee' }}>
                                    <div style={{ fontSize: '13px', color: '#777' }}>Tổng khóa học</div>
                                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{courses.length}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <div className="card" style={{ padding: '12px', boxShadow: 'none', border: '1px solid #eee' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Lượt học tập theo thời gian</div>
                                    <div style={{ width: '100%', height: '280px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={dashboardSeries}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={2} name="Người dùng hoạt động" />
                                                <Line type="monotone" dataKey="submissions" stroke="#f97316" strokeWidth={2} name="Lượt nộp bài" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="card" style={{ padding: '12px', boxShadow: 'none', border: '1px solid #eee' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Độ khó bài tập</div>
                                    <div style={{ width: '100%', height: '280px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={difficultyData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={78}>
                                                    {difficultyData.map((entry) => (
                                                        <Cell key={entry.name} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '12px', boxShadow: 'none', border: '1px solid #eee', marginTop: '12px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Số bài giải đúng</div>
                                <div style={{ width: '100%', height: '260px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dashboardSeries}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="solved" fill="#10b981" name="Số bài giải đúng" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                     )}

                     {activeMenu === 'problems' && (
                        <div className="card" style={{ padding: '16px' }}>
                            <form onSubmit={handleSaveProblem} style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                                    <input className="form-input" placeholder="Tên bài tập" value={problemForm.title} onChange={(e) => setProblemForm((prev) => ({ ...prev, title: e.target.value }))} />
                                    <select className="form-input" value={problemForm.difficulty} onChange={(e) => setProblemForm((prev) => ({ ...prev, difficulty: e.target.value }))}>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                    <input type="number" min="1" className="form-input" placeholder="Time limit (s)" value={problemForm.timeLimit} onChange={(e) => setProblemForm((prev) => ({ ...prev, timeLimit: e.target.value }))} />
                                    <input type="number" min="16" className="form-input" placeholder="Memory limit (MB)" value={problemForm.memoryLimit} onChange={(e) => setProblemForm((prev) => ({ ...prev, memoryLimit: e.target.value }))} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '10px' }}>
                                    <textarea className="form-input" rows={3} placeholder="Sample input" value={problemForm.sampleInput} onChange={(e) => setProblemForm((prev) => ({ ...prev, sampleInput: e.target.value }))} />
                                    <textarea className="form-input" rows={3} placeholder="Sample output" value={problemForm.sampleOutput} onChange={(e) => setProblemForm((prev) => ({ ...prev, sampleOutput: e.target.value }))} />
                                    <textarea className="form-input" rows={3} placeholder="Hidden input" value={problemForm.hiddenInput} onChange={(e) => setProblemForm((prev) => ({ ...prev, hiddenInput: e.target.value }))} />
                                    <textarea className="form-input" rows={3} placeholder="Hidden output" value={problemForm.hiddenOutput} onChange={(e) => setProblemForm((prev) => ({ ...prev, hiddenOutput: e.target.value }))} />
                                </div>
                                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-primary" type="submit">{editingProblemId ? 'Cập nhật' : 'Thêm bài tập'}</button>
                                    {editingProblemId && <button className="btn btn-outline" type="button" onClick={resetProblemForm}>Hủy</button>}
                                </div>
                            </form>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                                        <th style={cellStyle}>Tên bài</th>
                                        <th style={cellStyle}>Độ khó</th>
                                        <th style={cellStyle}>Giới hạn</th>
                                        <th style={{ ...cellStyle, textAlign: 'right' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {problems.map((problem) => (
                                        <tr key={problem.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={cellStyle}>{problem.title}</td>
                                            <td style={cellStyle}>{problem.difficulty}</td>
                                            <td style={cellStyle}>{problem.timeLimit}s / {problem.memoryLimit}MB</td>
                                            <td style={{ ...cellStyle, textAlign: 'right' }}>
                                                <button
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', marginRight: '8px', color: '#666' }}
                                                    onClick={() => {
                                                        setEditingProblemId(problem.id);
                                                        setProblemForm({ language: 'java', solutionCode: '', ...problem });
                                                    }}>
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f05123' }}
                                                    onClick={() => setProblems((prev) => prev.filter((item) => item.id !== problem.id))}>
                                                    <Trash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     )}

                     {activeMenu === 'users' && (
                        <div className="card" style={{ padding: '0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                                        <th style={cellStyle}>Họ tên</th>
                                        <th style={cellStyle}>Email</th>
                                        <th style={cellStyle}>Trạng thái</th>
                                        <th style={{ ...cellStyle, textAlign: 'center' }}>Tiến độ</th>
                                        <th style={{ ...cellStyle, textAlign: 'center' }}>Quản lý</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={cellStyle}>{user.name}</td>
                                            <td style={cellStyle}>{user.email}</td>
                                            <td style={cellStyle}>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: '12px', 
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    backgroundColor: user.status === 'active' ? '#d1fae5' : '#fee2e2',
                                                    color: user.status === 'active' ? '#065f46' : '#991b1b'
                                                }}>
                                                    {user.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                                                </span>
                                            </td>
                                            <td style={{ ...cellStyle, textAlign: 'center' }}>
                                                <button
                                                    className="btn"
                                                    style={{ 
                                                        padding: '8px 12px', 
                                                        color: '#000000'
                                                    }}
                                                    onClick={() => {
                                                        setSelectedUserForProgress(user);
                                                        setShowUserProgressModal(true);
                                                    }}>
                                                    Xem tiến độ
                                                </button>
                                            </td>
                                            <td style={{ ...cellStyle, textAlign: 'center' }}>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ padding: '8px 12px' }}
                                                    onClick={() =>
                                                        setUsers((prev) =>
                                                            prev.map((item) =>
                                                                item.id === user.id ? { ...item, status: item.status === 'active' ? 'locked' : 'active' } : item
                                                            )
                                                        )
                                                    }>
                                                    {user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     )}

                    {activeMenu === 'courses' && (
                        <>
                            {/* NẾU ĐANG KHÔNG BẬT CHẾ ĐỘ CHỈNH SỬA -> HIỆN BẢNG KHÓA HỌC */}
                            {!showCurriculumEditor ? (
                                <div className="card" style={{ padding: '0', marginBottom: '16px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>ID</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Tên khóa học</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Học viên</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Giá</th>
                                                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map((course) => (
                                                <tr key={course.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontFamily: 'monospace', color: '#64748b' }}>
                                                            #{course.id?.slice(-6).toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ fontWeight: 600 }}>{course.name}</div>
                                                        <div style={{ fontSize: '12px', color: '#888' }}>{course.description || 'Không có mô tả'}</div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>{course.learners || 0}</td>
                                                    <td style={{ padding: '16px', color: '#f05123', fontWeight: 600 }}>{course.price}đ</td>
                                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                                        <button
                                                            title="Syllabus Manager (Quản lý nội dung)"
                                                            className="btn btn-primary"
                                                            style={{ padding: '6px 12px', fontSize: '13px', marginRight: '8px' }}
                                                            onClick={() => {
                                                                setSelectedCourseId(course.id);
                                                                setSelectedModuleId(course.modules?.[0]?.id || null);
                                                                setSelectedLessonId(course.modules?.[0]?.lessons?.[0]?.id || null);
                                                                setShowCurriculumEditor(true); // BẬT CHẾ ĐỘ SPLIT-PANE
                                                            }}>
                                                            <BookOpen size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Cấu hình nội dung
                                                        </button>
                                                        <button
                                                            title="Sửa thông tin"
                                                            style={{ border: 'none', background: 'none', cursor: 'pointer', marginRight: '8px', color: '#666' }}
                                                            onClick={() => {
                                                                setEditingCourseId(course.id);
                                                                setCourseForm({ name: course.name, price: course.price, description: course.description });
                                                                setShowAddCourseModal(true);
                                                            }}>
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            title="Xóa khóa học"
                                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f05123' }}
                                                            onClick={() => handleDeleteCourse(course.id)}>
                                                            <Trash size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                
                                /* 🚀 GIAO DIỆN COURSE BUILDER (SPLIT-PANE) SIÊU XỊN Ở ĐÂY 🚀 */
                                <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
                                    
                                    {/* THANH TOP-BAR QUAY LẠI */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                        <div>
                                            <button 
                                                onClick={() => setShowCurriculumEditor(false)}
                                                style={{ border: 'none', background: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '14px', padding: 0, marginBottom: '8px' }}>
                                                ← Quay lại danh sách khóa học
                                            </button>
                                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Đang cấu hình: <span style={{ color: '#f05123' }}>{selectedCourse?.name}</span></h2>
                                        </div>
                                    </div>

                                    {/* KHUNG SPLIT-PANE CHÍNH */}
                                    <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
                                        
                                        {/* --------- CỘT TRÁI: TREE-VIEW (MỤC LỤC) --------- */}
                                        <div style={{ width: '350px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                                            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>📚 Cấu trúc chương trình</h3>
                                            </div>

                                            {/* Danh sách Chương và Bài học */}
                                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                                                {(selectedCourse?.modules || []).map((module, mIndex) => (
                                                    <div key={module.id} style={{ marginBottom: '16px' }}>
                                                        {/* Header Chương */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', padding: '10px 12px', borderRadius: '6px', fontWeight: 600, fontSize: '14px' }}>
                                                            {/* <span>Chương {mIndex + 1}: {module.title}</span> */}
                                                            <span>{mIndex + 1}: {module.title}</span>
                                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                                {/* NÚT SỬA */}
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // Ngăn chặn nổi bọt sự kiện
                                                                        handleEditModule(module.id, module.title);
                                                                    }}
                                                                    style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }} 
                                                                    title="Sửa tên chương"
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                
                                                                {/* NÚT XÓA */}
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteModule(module.id);
                                                                    }}
                                                                    style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }} 
                                                                    title="Xóa chương này"
                                                                >
                                                                    <Trash size={14} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Danh sách Bài học của Chương */}
                                                        <div style={{ paddingLeft: '12px', marginTop: '8px' }}>
                                                            {module.lessons?.map((lesson) => {
                                                                const isActive = selectedLessonId === lesson.id;
                                                                return (
                                                                    <div 
                                                                        key={lesson.id}
                                                                        onClick={() => {
                                                                            setSelectedModuleId(module.id);
                                                                            setSelectedLessonId(lesson.id);
                                                                            setIsEditingLesson(false);
                                                                        }}
                                                                        style={{ 
                                                                            display: 'flex', alignItems: 'center', padding: '8px 12px', 
                                                                            cursor: 'pointer', borderRadius: '6px', marginBottom: '4px', fontSize: '13px',
                                                                            backgroundColor: isActive ? '#fef2f2' : 'transparent',
                                                                            color: isActive ? '#f05123' : '#4b5563',
                                                                            borderLeft: isActive ? '3px solid #f05123' : '3px solid transparent'
                                                                        }}>
                                                                        <span style={{ marginRight: '8px', fontSize: '16px' }}>
                                                                            {lesson.lessonType === 'video' ? '▶' : lesson.lessonType === 'coding' ? '💻' : '📄'}
                                                                        </span>
                                                                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isActive ? 600 : 400 }}>
                                                                            {lesson.title}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            })}

                                                            {/* Nút thêm nhanh Bài học vào Chương này */}
                                                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', paddingLeft: '12px' }}>
                                                                <input 
                                                                    className="form-input" 
                                                                    placeholder="Tên bài học (hoặc nhấn Enter)..." 
                                                                    style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                                                                    onChange={(e) => {
                                                                        setLessonTitle(e.target.value);
                                                                        setSelectedModuleId(module.id); // Xác định đang gõ ở chương nào
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                                                            handleAddLesson();
                                                                            e.target.value = ''; // Reset ô nhập sau khi thêm
                                                                        }
                                                                    }}
                                                                />
                                                                <select 
                                                                    className="form-input" 
                                                                    style={{ width: '90px', fontSize: '12px', padding: '6px' }}
                                                                    onChange={(e) => setLessonTypeToCreate(e.target.value)}
                                                                >
                                                                    {lessonTypeOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                                                                </select>
                                                                
                                                                {/* 🚀 NÚT THÊM HIỆN RÕ RÀNG Ở ĐÂY */}
                                                                <button 
                                                                    type="button" 
                                                                    className="btn btn-outline" 
                                                                    style={{ padding: '4px 10px', fontSize: '12px', color: '#f05123', borderColor: '#f05123' }}
                                                                    onClick={(e) => {
                                                                        if (lessonTitle.trim() === '') return;
                                                                        handleAddLesson();
                                                                        // Mẹo nhỏ: Reset ô input ngay bên cạnh sau khi click
                                                                        e.currentTarget.parentElement.querySelector('input').value = '';
                                                                    }}
                                                                >
                                                                    + Thêm
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Thêm Chương mới ở cuối cùng */}
                                                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #d1d5db' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <input 
                                                            className="form-input" 
                                                            value={moduleTitle} 
                                                            onChange={(e) => setModuleTitle(e.target.value)} 
                                                            placeholder="Nhập tên chương mới..." 
                                                            style={{ flex: 1, fontSize: '13px' }}
                                                        />
                                                        <button className="btn btn-outline" type="button" onClick={handleAddModule} style={{ padding: '8px 12px' }}>+ Chương</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* --------- CỘT PHẢI: TRÌNH SOẠN THẢO CHI TIẾT BÀI HỌC --------- */}
                                        <div style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflowY: 'auto', padding: '24px' }}>
                                            {!selectedLesson ? (
                                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                                    <BookOpen size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                                    <h3 style={{ margin: 0, fontWeight: 500 }}>Hãy chọn một bài học ở cột trái để bắt đầu chỉnh sửa</h3>
                                                </div>
                                            ) : (
                                                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                                                    
                                                    {/* Header của bài học đang chọn */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                                <span style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                                                                    {selectedLessonTypeLabel}
                                                                </span>
                                                            </div>
                                                            {isEditingLesson ? (
                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                                                                    <input 
                                                                        className="form-input" 
                                                                        value={lessonEditForm.title} 
                                                                        onChange={(e) => setLessonEditForm((prev) => ({ ...prev, title: e.target.value }))} 
                                                                        style={{ flex: 1, minWidth: '300px', fontSize: '16px', fontWeight: 700 }} 
                                                                    />
                                                                    <select 
                                                                        className="form-input" 
                                                                        value={lessonEditForm.lessonType} 
                                                                        onChange={(e) => setLessonEditForm((prev) => ({ ...prev, lessonType: e.target.value }))}
                                                                        style={{ width: 'auto', minWidth: '150px' }}
                                                                    >
                                                                        {lessonTypeOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                                                                    </select>
                                                                    <button className="btn btn-primary" onClick={handleSaveLessonEdit} style={{ whiteSpace: 'nowrap' }}>Lưu</button>
                                                                    <button className="btn btn-outline" onClick={() => setIsEditingLesson(false)} style={{ whiteSpace: 'nowrap' }}>Hủy</button>
                                                                </div>
                                                            ) : (
                                                                <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                    {selectedLesson.title}
                                                                    <button onClick={handleEditLesson} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666', padding: 0 }}><Edit size={18} /></button>
                                                                </h2>
                                                            )}
                                                        </div>
                                                        <button className="btn btn-outline" onClick={handleDeleteLesson} style={{ color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }}>
                                                            <Trash size={16} style={{ marginRight: '6px' }} /> Xóa bài này
                                                        </button>
                                                    </div>

                                                    {/* Khu vực Nhập liệu tùy theo Loại bài học */}
                                                    
                                                    {/* NẾU LÀ VIDEO HOẶC LÝ THUYẾT ĐỀU HIỂN THỊ Ô NHẬP VIDEO VÀ TRÌNH SOẠN THẢO */}
                                                    {(selectedLesson.lessonType === 'video' || selectedLesson.lessonType === 'theory') && (
                                                        <>
                                                            <div className="card" style={{ padding: '20px', boxShadow: 'none', border: '1px solid #e5e7eb', backgroundColor: '#f8fafc', marginBottom: '20px' }}>
                                                                <label className="form-label" style={{ fontWeight: 600 }}>Link YouTube (Video minh họa - Tùy chọn)</label>
                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                <input
                                                                    className="form-input"
                                                                    style={{ flex: 1 }}
                                                                    placeholder="VD: https://www.youtube.com/watch?v=..."
                                                                    value={selectedLesson.videoUrl || ''}
                                                                    onChange={(e) => updateSelectedLesson((lesson) => ({ ...lesson, videoUrl: e.target.value }))}
                                                                />
                                                                <button className="btn btn-primary" onClick={handleSaveLessonContentToDB}>💾 Lưu URL</button>
                                                            </div>
                                                            {selectedLesson.videoUrl && (
                                                                <div style={{ marginTop: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                                                    <iframe title="preview" src={toEmbedUrl(selectedLesson.videoUrl)} width="100%" height="450" style={{ border: 'none' }} allowFullScreen />
                                                                </div>
                                                            )}
                                                            </div>

                                                            <div className="card" style={{ padding: '0', boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <FileText size={20} color="#3b82f6" />
                                                                    <strong style={{ fontSize: '16px' }}>Trình soạn thảo bài giảng</strong>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                                                                        {lastSavedAt ? `Đã lưu: ${lastSavedAt.toLocaleTimeString()}` : 'Chưa lưu'}
                                                                    </span>
                                                                    <button className="btn btn-primary" onClick={handleSaveLessonContentToDB} style={{ padding: '8px 20px', borderRadius: '6px' }}>
                                                                        💾 Lưu nội dung
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div style={{ padding: '24px' }}>
                                                                <RichTextEditor 
                                                                    data={selectedLesson.content} 
                                                                    onChange={(newData) => updateSelectedLesson((lesson) => ({ ...lesson, content: newData }))} 
                                                                />
                                                            </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* 3. NẾU LÀ CODING */}
                                                    {/* 3. NẾU LÀ CODING */}
                                                    {selectedLesson.lessonType === 'coding' && (
                                                        <div style={{ backgroundColor: '#fff' }}>
                                                            
                                                            <div className="card" style={{ padding: '24px', boxShadow: 'none', border: '1px solid #e3e6ea', backgroundColor: '#f8fafc' }}>
                                                                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <Code2 size={22} color="#f05123" />
                                                                    Cấu hình Đề bài & Chấm điểm tự động
                                                                </h3>
                                                                
                                                                <form onSubmit={handleSaveProblem}>
                                                                    {/* Đề bài */}
                                                                    <div style={{ marginBottom: '16px' }}>
                                                                        <label className="form-label" style={{ fontSize: '14px', fontWeight: 600 }}>Mô tả đề bài <span style={{ color: '#f05123' }}>*</span></label>
                                                                        <textarea 
                                                                            className="form-input" rows="8"
                                                                            value={problemForm.description} 
                                                                            onChange={(e) => setProblemForm((prev) => ({ ...prev, description: e.target.value }))} 
                                                                            required style={{ resize: 'vertical' }}
                                                                        />
                                                                    </div>

                                                                    {/* Các cài đặt cơ bản */}
                                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                                                        <div>
                                                                            <label className="form-label">Tên bài tập</label>
                                                                            <input className="form-input" value={problemForm.title} onChange={(e) => setProblemForm((prev) => ({ ...prev, title: e.target.value }))} required />
                                                                        </div>
                                                                        <div>
                                                                            <label className="form-label">Độ khó</label>
                                                                            <select className="form-input" value={problemForm.difficulty} onChange={(e) => setProblemForm((prev) => ({ ...prev, difficulty: e.target.value }))}>
                                                                                <option value="Easy">Dễ</option><option value="Medium">Trung bình</option><option value="Hard">Khó</option>
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="form-label">Ngôn ngữ</label>
                                                                            <select className="form-input" value={problemForm.language} onChange={(e) => setProblemForm((prev) => ({ ...prev, language: e.target.value }))}>
                                                                                {languageOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="form-label">Thời gian (giây)</label>
                                                                            <input type="number" min="1" className="form-input" placeholder="1" value={problemForm.timeLimit} onChange={(e) => setProblemForm((prev) => ({ ...prev, timeLimit: e.target.value }))} />
                                                                        </div>
                                                                        <div>
                                                                            <label className="form-label">Bộ nhớ (MB)</label>
                                                                            <input type="number" min="16" className="form-input" placeholder="128" value={problemForm.memoryLimit} onChange={(e) => setProblemForm((prev) => ({ ...prev, memoryLimit: e.target.value }))} />
                                                                        </div>
                                                                    </div>

                                                                    {/* AI Generation */}
                                                                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
                                                                        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#0369a1' }}>🤖 Tạo nhanh với AI</div>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'end' }}>
                                                                            <div>
                                                                                <input
                                                                                    className="form-input"
                                                                                    placeholder="VD: Tạo bài tính tổng hai số nguyên"
                                                                                    value={problemAiPrompt}
                                                                                    onChange={(e) => setProblemAiPrompt(e.target.value)}
                                                                                    style={{ backgroundColor: '#fff' }}
                                                                                />
                                                                            </div>
                                                                            <button type="button" className="btn" style={{ backgroundColor: '#0369a1', color: '#fff', border: 'none', padding: '8px 16px' }} onClick={handleGenerateProblemWithAI}>
                                                                                Tạo với AI
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Code khởi đầu */}
                                                                    <div style={{ marginBottom: '16px' }}>
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

                                                                    {/* Test Cases */}
                                                                    <div style={{ marginBottom: '16px' }}>
                                                                        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#555' }}>Test Cases</div>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', backgroundColor: '#fafafa' }}>
                                                                                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#16a34a' }}>Sample Test (hiển thị cho học viên)</div>
                                                                                <div style={{ marginBottom: '8px' }}>
                                                                                    <label className="form-label" style={{ fontSize: '12px' }}>Input</label>
                                                                                    <textarea className="form-input" rows={3} placeholder="2 3" value={problemForm.sampleInput} onChange={(e) => setProblemForm((prev) => ({ ...prev, sampleInput: e.target.value }))} style={{ fontFamily: 'var(--font-code)', fontSize: '13px' }} />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="form-label" style={{ fontSize: '12px' }}>Output</label>
                                                                                    <textarea className="form-input" rows={3} placeholder="5" value={problemForm.sampleOutput} onChange={(e) => setProblemForm((prev) => ({ ...prev, sampleOutput: e.target.value }))} style={{ fontFamily: 'var(--font-code)', fontSize: '13px' }} />
                                                                                </div>
                                                                            </div>
                                                                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', backgroundColor: '#fafafa' }}>
                                                                                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#f97316' }}>Hidden Test (chấm điểm)</div>
                                                                                <div style={{ marginBottom: '8px' }}>
                                                                                    <label className="form-label" style={{ fontSize: '12px' }}>Input</label>
                                                                                    <textarea className="form-input" rows={3} placeholder="10 20" value={problemForm.hiddenInput} onChange={(e) => setProblemForm((prev) => ({ ...prev, hiddenInput: e.target.value }))} style={{ fontFamily: 'var(--font-code)', fontSize: '13px' }} />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="form-label" style={{ fontSize: '12px' }}>Output</label>
                                                                                    <textarea className="form-input" rows={3} placeholder="30" value={problemForm.hiddenOutput} onChange={(e) => setProblemForm((prev) => ({ ...prev, hiddenOutput: e.target.value }))} style={{ fontFamily: 'var(--font-code)', fontSize: '13px' }} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Gợi ý / Ghi chú */}
                                                                    <div style={{ marginBottom: '16px' }}>
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
                                                                    <div style={{ marginBottom: '16px' }}>
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

                                                                    {/* Action buttons */}
                                                                    <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                                                                        <button className="btn btn-primary" type="submit" style={{ padding: '10px 20px' }}>
                                                                            {editingProblemId ? 'Cập nhật bài tập' : 'Tạo bài tập mới'}
                                                                        </button>
                                                                        {editingProblemId && (
                                                                            <button className="btn btn-outline" type="button" onClick={resetProblemForm} style={{ padding: '10px 20px' }}>
                                                                                Hủy
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </form>

                                                                {/* Danh sách bài tập đã tạo */}
                                                                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '2px solid #e5e7eb' }}>
                                                                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#555' }}>Danh sách bài tập trong bài học này</div>
                                                                    
                                                                    {/* SỬA selectedLessonProblems THÀNH problems */}
                                                                    {problems.length === 0 ? (
                                                                        <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #ddd', borderRadius: '8px', color: '#999' }}>
                                                                            Chưa có bài tập nào. Hãy tạo bài tập mới ở trên.
                                                                        </div>
                                                                    ) : (
                                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                                                                            <thead>
                                                                                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                                                                    <th style={{ ...cellStyle, fontWeight: 600 }}>Tên bài</th>
                                                                                    <th style={{ ...cellStyle, fontWeight: 600, textAlign: 'center' }}>Độ khó</th>
                                                                                    <th style={{ ...cellStyle, fontWeight: 600, textAlign: 'center' }}>Giới hạn</th>
                                                                                    <th style={{ ...cellStyle, textAlign: 'center', fontWeight: 600 }}>Hành động</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                
                                                                                {/* SỬA selectedLessonProblems THÀNH problems */}
                                                                                {problems.map((problem) => (
                                                                                    <tr key={problem.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                                                        <td style={cellStyle}>
                                                                                            <div style={{ fontWeight: 500 }}>{problem.title}</div>
                                                                                        </td>
                                                                                        <td style={{ ...cellStyle, textAlign: 'center' }}>
                                                                                            <span style={{
                                                                                                padding: '4px 10px',
                                                                                                borderRadius: '12px',
                                                                                                fontSize: '12px',
                                                                                                fontWeight: 500,
                                                                                                backgroundColor: problem.difficulty === 'Easy' ? '#d1fae5' : problem.difficulty === 'Medium' ? '#fed7aa' : '#fecaca',
                                                                                                color: problem.difficulty === 'Easy' ? '#065f46' : problem.difficulty === 'Medium' ? '#92400e' : '#991b1b'
                                                                                            }}>
                                                                                                {problem.difficulty}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td style={{ ...cellStyle, textAlign: 'center', fontFamily: 'var(--font-code)', fontSize: '13px' }}>
                                                                                            {problem.timeLimit}s / {problem.memoryLimit}MB
                                                                                        </td>
                                                                                        <td style={{ ...cellStyle, textAlign: 'center' }}>
                                                                                            
                                                                                            {/* 🚀 NÚT CHỈNH SỬA (FIXED MAP DATA) */}
                                                                                            <button 
                                                                                                title="Chỉnh sửa"
                                                                                                style={{ border: 'none', background: 'none', cursor: 'pointer', marginRight: '12px', color: '#666' }} 
                                                                                                onClick={() => { 
                                                                                                    setEditingProblemId(problem.id); 
                                                                                                    setProblemForm({ 
                                                                                                        title: problem.title || '',
                                                                                                        description: problem.description || '',
                                                                                                        difficulty: problem.difficulty || 'Easy',
                                                                                                        language: problem.language || 'java',
                                                                                                        timeLimit: problem.timeLimit || 1,
                                                                                                        memoryLimit: problem.memoryLimit || 128,
                                                                                                        starterCode: problem.starterCode || '',
                                                                                                        solutionCode: problem.solutionCode || '',
                                                                                                        hints: problem.hints || '',
                                                                                                        sampleInput: problem.sampleInput || '',
                                                                                                        sampleOutput: problem.sampleOutput || '',
                                                                                                        hiddenInput: problem.hiddenInput || '',
                                                                                                        hiddenOutput: problem.hiddenOutput || '' 
                                                                                                    }); 
                                                                                                }}>
                                                                                                <Edit size={18} />
                                                                                            </button>

                                                                                            {/* 🚀 NÚT XÓA (FIXED ARRAY TARGET) */}
                                                                                            {/* 🚀 NÚT XÓA BÀI TẬP (ĐÃ MỞ KHÓA API) */}
                                                                                            <button 
                                                                                                title="Xóa"
                                                                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f05123' }} 
                                                                                                onClick={() => {
                                                                                                    setConfirmConfig({
                                                                                                        isOpen: true,
                                                                                                        message: 'Bạn có chắc muốn xóa bài tập này không? Hành động này không thể hoàn tác!',
                                                                                                        onConfirm: async () => {
                                                                                                            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                                                                                                            toast.loading('Đang xóa bài tập...', { id: 'delete-prob' });
                                                                                                            try {
                                                                                                                await deleteProblem(problem.id); 
                                                                                                                
                                                                                                                setProblems((prev) => prev.filter((item) => item.id !== problem.id)); 
                                                                                                                
                                                                                                                toast.success('Đã xóa bài tập thành công!', { id: 'delete-prob' });
                                                                                                            } catch(err) {
                                                                                                                console.error(err);
                                                                                                                toast.error('Lỗi khi xóa bài tập. Bác kiểm tra lại backend nhé!', { id: 'delete-prob' });
                                                                                                            }
                                                                                                        }
                                                                                                    });
                                                                                                }}>
                                                                                                <Trash size={18} />
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                     )}

                     {activeMenu === 'settings' && (
                        <>
                            <div className="card" style={{ padding: '20px', marginBottom: '16px', backgroundColor: '#f8f9fa', border: '1px solid #e3e6ea' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Settings size={20} />
                                    Thông tin hệ thống
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
                                    <div>
                                        <span style={{ color: '#777', marginRight: '6px' }}>Phiên bản:</span>
                                        <span style={{ fontWeight: 600 }}>v1.0.0</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#777', marginRight: '6px' }}>Tổng khóa học:</span>
                                        <span style={{ fontWeight: 600 }}>{courses.length}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#777', marginRight: '6px' }}>Tổng người dùng:</span>
                                        <span style={{ fontWeight: 600 }}>{users.length}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#777', marginRight: '6px' }}>Tổng bài tập:</span>
                                        <span style={{ fontWeight: 600 }}>{problems.length}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#777', marginRight: '6px' }}>Trạng thái:</span>
                                        <span style={{ fontWeight: 600, color: settings.maintenanceMode ? '#f05123' : '#16a34a' }}>
                                            {settings.maintenanceMode ? 'Đang bảo trì' : 'Hoạt động'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Cài đặt chung</h2>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Tên trang web</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={settings.siteName}
                                            onChange={(e) => {
                                                setSettings({ ...settings, siteName: e.target.value });
                                                setSettingsChanged(true);
                                            }}
                                            style={{ width: '100%', maxWidth: '500px' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Mô tả trang web</label>
                                        <textarea
                                            className="form-input"
                                            value={settings.siteDescription}
                                            onChange={(e) => {
                                                setSettings({ ...settings, siteDescription: e.target.value });
                                                setSettingsChanged(true);
                                            }}
                                            rows={3}
                                            style={{ width: '100%', maxWidth: '500px', resize: 'vertical' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Email quản trị viên</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={settings.adminEmail}
                                            onChange={(e) => {
                                                setSettings({ ...settings, adminEmail: e.target.value });
                                                setSettingsChanged(true);
                                            }}
                                            style={{ width: '100%', maxWidth: '500px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Cài đặt thực thi code</h2>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Thời gian chạy tối đa (giây)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={settings.defaultCodeTimeout}
                                            onChange={(e) => {
                                                setSettings({ ...settings, defaultCodeTimeout: Number(e.target.value) });
                                                setSettingsChanged(true);
                                            }}
                                            min="1"
                                            max="60"
                                            style={{ width: '200px' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Giới hạn bộ nhớ mặc định (MB)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={settings.defaultMemoryLimit}
                                            onChange={(e) => {
                                                setSettings({ ...settings, defaultMemoryLimit: Number(e.target.value) });
                                                setSettingsChanged(true);
                                            }}
                                            min="64"
                                            max="2048"
                                            step="64"
                                            style={{ width: '200px' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Kích thước file tải lên tối đa (MB)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={settings.maxUploadSize}
                                            onChange={(e) => {
                                                setSettings({ ...settings, maxUploadSize: Number(e.target.value) });
                                                setSettingsChanged(true);
                                            }}
                                            min="1"
                                            max="100"
                                            style={{ width: '200px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Tính năng</h2>
                                <div style={{ display: 'grid', gap: '14px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={settings.maintenanceMode}
                                            onChange={(e) => {
                                                setSettings({ ...settings, maintenanceMode: e.target.checked });
                                                setSettingsChanged(true);
                                            }}
                                            style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '14px', color: settings.maintenanceMode ? '#f05123' : 'inherit', fontWeight: settings.maintenanceMode ? 600 : 400 }}>Chế độ bảo trì (chặn truy cập người dùng)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Giao diện</h2>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Chủ đề</label>
                                    <select
                                        className="form-input"
                                        value={settings.theme}
                                        onChange={(e) => {
                                            setSettings({ ...settings, theme: e.target.value });
                                            setSettingsChanged(true);
                                        }}
                                        style={{ width: '200px' }}>
                                        <option value="light">Sáng</option>
                                        <option value="dark">Tối</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                {settingsChanged && (
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            // Reset về giá trị ban đầu
                                            setSettings({
                                                siteName: 'Learning Platform',
                                                siteDescription: 'Nền tảng học lập trình trực tuyến',
                                                adminEmail: 'admin@learning.vn',
                                                allowRegistration: true,
                                                emailNotifications: true,
                                                autoApproveUsers: false,
                                                maxUploadSize: 10,
                                                defaultCodeTimeout: 5,
                                                defaultMemoryLimit: 256,
                                                enableAI: true,
                                                maintenanceMode: false,
                                                showLeaderboard: true,
                                                theme: 'light'
                                            });
                                            setSettingsChanged(false);
                                        }}
                                        style={{ border: '1px solid #ddd' }}>
                                        Đặt lại
                                    </button>
                                )}
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        // console.log('Saving settings:', settings);
                                        setSettingsChanged(false);
                                        alert('Đã lưu cài đặt thành công!');
                                    }}
                                    disabled={!settingsChanged}
                                    style={{ opacity: settingsChanged ? 1 : 0.6, cursor: settingsChanged ? 'pointer' : 'not-allowed' }}>
                                    Lưu cài đặt
                                </button>
                            </div>
                        </>
                     )}
       </main>

            {/* Modal thêm/sửa khóa học */}
            {showAddCourseModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                    onClick={() => setShowAddCourseModal(false)}>
                    <div
                        className="card"
                        style={{
                            width: '90%',
                            maxWidth: '500px',
                            padding: '24px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
                            {editingCourseId ? 'Cập nhật thông tin khóa học' : 'Thêm khóa học mới'}
                        </h2>
                        <form onSubmit={handleSaveCourse}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                                    Tên khóa học <span style={{ color: '#f05123' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Nhập tên khóa học..."
                                    value={courseForm.name}
                                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                                    Giá
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="VD: 1.299.000đ"
                                    value={courseForm.price}
                                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                                    Mô tả
                                </label>
                                <textarea
                                    className="form-input"
                                    placeholder="Nhập mô tả khóa học..."
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    rows={4}
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setShowAddCourseModal(false)}
                                    style={{ border: '1px solid #ddd' }}>
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary">
                                    {editingCourseId ? 'Cập nhật' : 'Thêm khóa học'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal xem tiến độ người dùng */}
            {showUserProgressModal && selectedUserForProgress && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                    onClick={() => setShowUserProgressModal(false)}>
                    <div
                        className="card"
                        style={{
                            width: '90%',
                            maxWidth: '800px',
                            padding: '24px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                                Tiến độ học tập - {selectedUserForProgress.name}
                            </h2>
                            <button
                                style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}
                                onClick={() => setShowUserProgressModal(false)}>
                                ×
                            </button>
                        </div>

                        {(() => {
                            const progressData = userProgressData[selectedUserForProgress.id];
                            if (!progressData) {
                                return <div style={{ color: '#777', padding: '20px', textAlign: 'center' }}>Chưa có dữ liệu học tập</div>;
                            }

                            return (
                                <>
                                    {/* Thông tin tổng quan */}
                                    <div style={{ 
                                        backgroundColor: '#f8f9fa', 
                                        padding: '16px', 
                                        borderRadius: '8px', 
                                        marginBottom: '20px',
                                        border: '1px solid #e3e6ea'
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>Ngày tham gia</div>
                                                <div style={{ fontSize: '16px', fontWeight: 600 }}>{progressData.joinedDate}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>Hoạt động gần nhất</div>
                                                <div style={{ fontSize: '16px', fontWeight: 600 }}>{progressData.lastActivity}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>Tổng thời gian học</div>
                                                <div style={{ fontSize: '16px', fontWeight: 600, color: '#000000' }}>{progressData.totalStudyTime}h</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>Lượt nộp bài</div>
                                                <div style={{ fontSize: '16px', fontWeight: 600, color: '#16a343' }}>{progressData.totalSubmissions}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>Bài tập hoàn thành</div>
                                                <div style={{ fontSize: '16px', fontWeight: 600, color: '#b02121' }}>{progressData.totalProblemsCompleted}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danh sách khóa học đã đăng ký */}
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Khóa học đã đăng ký</h3>
                                    {progressData.enrolledCourses.length === 0 ? (
                                        <div style={{ color: '#777', padding: '20px', textAlign: 'center', border: '1px dashed #ddd', borderRadius: '8px' }}>
                                            Chưa đăng ký khóa học nào
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            {progressData.enrolledCourses.map((course, idx) => (
                                                <div 
                                                    key={idx}
                                                    style={{ 
                                                        border: '1px solid #e5e7eb', 
                                                        borderRadius: '8px', 
                                                        padding: '16px',
                                                        backgroundColor: '#fff'
                                                    }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                        <div>
                                                            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                                                                {course.courseName}
                                                            </div>
                                                            <div style={{ fontSize: '13px', color: '#777' }}>
                                                                Truy cập gần nhất: {course.lastAccessed}
                                                            </div>
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '18px', 
                                                            fontWeight: 700, 
                                                            color: course.progress >= 80 ? '#16a34a' : course.progress >= 50 ? '#3b82f6' : '#f97316'
                                                        }}>
                                                            {course.progress}%
                                                        </div>
                                                    </div>

                                                    {/* Progress bar */}
                                                    <div style={{ 
                                                        width: '100%', 
                                                        height: '8px', 
                                                        backgroundColor: '#e5e7eb', 
                                                        borderRadius: '4px',
                                                        overflow: 'hidden',
                                                        marginBottom: '12px'
                                                    }}>
                                                        <div style={{ 
                                                            width: `${course.progress}%`, 
                                                            height: '100%', 
                                                            backgroundColor: course.progress >= 80 ? '#16a34a' : course.progress >= 50 ? '#3b82f6' : '#f97316',
                                                            transition: 'width 0.3s ease'
                                                        }} />
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                                                        <div>
                                                            <span style={{ color: '#777' }}>Bài học: </span>
                                                            <span style={{ fontWeight: 600 }}>{course.completedLessons}/{course.totalLessons}</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#777' }}>Điểm TB: </span>
                                                            <span style={{ 
                                                                fontWeight: 600,
                                                                color: course.avgScore >= 80 ? '#16a34a' : course.avgScore >= 60 ? '#3b82f6' : '#f97316'
                                                            }}>
                                                                {course.avgScore}/100
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                        <button
                                            className="btn"
                                            onClick={() => setShowUserProgressModal(false)}
                                            style={{ width: '100%', border: '1px solid #ddd' }}>
                                            Đóng
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
            
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