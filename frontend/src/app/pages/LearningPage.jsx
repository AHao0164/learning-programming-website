import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

import { Spinner } from '../components/ui/spinner';
import confetti from 'canvas-confetti';

import { CodeEditor } from '../components/workspace/CodeEditor';
import ReactPlayer from 'react-player';

import { getCourseBySlug, getLessonBySlug, getProblemByLessonId } from '../../../services/course.service';
import { progressService } from '../../../services/progress.service';
import { enrollmentService } from '../../../services/enrollment.service';
import { CommentSection } from '../components/comments/CommentSection'; 

export const LearningPage = () => {
  const { slug } = useParams(); 
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [lessonProblems, setLessonProblems] = useState([]); 
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const currentProblem = lessonProblems[currentProblemIndex] || null;
  const [completedLessons, setCompletedLessons] = useState([]); 

  const [searchQuery, setSearchQuery] = useState('');
  const [isCommentOpen, setIsCommentOpen] = useState(false); 
  const [canGoNext, setCanGoNext] = useState(false);

  const unlockNextFromVideoProgress = (event) => {
    if (canGoNext) return;

    const media = event.currentTarget;
    if (media?.duration && Number.isFinite(media.duration)) {
        const watchedRatio = media.currentTime / media.duration;
        if (watchedRatio >= 0.3) {
            setCanGoNext(true);
        }
    }
  };

  const totalLessons = course?.chapters?.reduce((acc, chapter) => acc + chapter.lessons.length, 0) || 0;

  useEffect(() => {
    const fetchCourseAndFirstLesson = async () => {
      try {
        const courseData = await getCourseBySlug(slug);
        const fetchedCourse = courseData.data;
        setCourse(fetchedCourse);

        if (fetchedCourse.chapters?.length > 0 && fetchedCourse.chapters[0].lessons?.length > 0) {
          const firstLessonSlug = fetchedCourse.chapters[0].lessons[0].slug;
          fetchLessonContent(firstLessonSlug);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Lỗi tải trang học", error);
        setLoading(false);
      }
    };
    fetchCourseAndFirstLesson();
  }, [slug]);

  useEffect(() => {
    if (course && course._id) {
        progressService.getUserProgress(course._id)
            .then(res => setCompletedLessons(res.data.data))
            .catch(err => console.error("Lỗi lấy tiến độ", err));
    }
  }, [course]);

  useEffect(() => {
    if (course?._id && currentLesson?.slug) {
        let currentProgress = 0;
        if (totalLessons > 0 && completedLessons) {
            currentProgress = Math.round((completedLessons.length / totalLessons) * 100);
        }
        enrollmentService.updateLastAccessed(course._id, currentLesson.slug, currentProgress)
            .catch(err => console.error("Lỗi lưu vết tiến độ:", err));

        if (completedLessons.includes(currentLesson._id)) {
            setCanGoNext(true);
        } else {
            if (currentLesson.type === 'video') {
                setCanGoNext(false);
            } else if (currentLesson.type === 'theory') {
                setCanGoNext(false);
                const timer = setTimeout(() => setCanGoNext(true), 3000);
                return () => clearTimeout(timer);
            } else if (currentLesson.type === 'coding') {
                setCanGoNext(false);
            }
        }
    }
  }, [currentLesson, course, completedLessons, totalLessons]);

  const fetchLessonContent = async (lessonSlug) => {
    setLoading(true);
    setLessonProblems([]); 
    setCurrentProblemIndex(0); 
    setIsCommentOpen(false);
    try {
      const lessonData = await getLessonBySlug(lessonSlug);
      const lesson = lessonData.data;
      setCurrentLesson(lesson);

      if (lesson.type === 'coding') {
          try {
              const res = await getProblemByLessonId(lesson._id);
              const list = res.data?.data || res.data || [];
              const problemsArray = Array.isArray(list) ? list : [list];
              setLessonProblems(problemsArray);
          } catch (err) {
              console.log("Bài này chưa có đề bài trong Database");
          }
      }
    } catch (error) {
      console.error("Lỗi tải bài học", error);
    } finally {
      setLoading(false);
    }
  };

  const flatLessons = [];
  course?.chapters?.forEach(ch => ch.lessons.forEach(l => flatLessons.push(l)));
  const currentLessonIndexInFlat = flatLessons.findIndex(l => l._id === currentLesson?._id);

  const hasNextProblem = currentLesson?.type === 'coding' && currentProblemIndex < lessonProblems.length - 1;
  const hasPrevProblem = currentLesson?.type === 'coding' && currentProblemIndex > 0;
  const hasNextLesson = currentLessonIndexInFlat >= 0 && currentLessonIndexInFlat < flatLessons.length - 1;
  const hasPrevLesson = currentLessonIndexInFlat > 0;

  const handleNextClick = async () => {
    if (hasNextProblem) {
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
        toast.success("Chính xác! Cùng làm bài tập tiếp theo nhé 🚀");
        setCurrentProblemIndex(prev => prev + 1);
        return; 
    }

    try {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        const response = await progressService.markCompleted(currentLesson._id, course._id);
        const data = response.data;
        
        if (data.isNewCompletion && data.user) {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...currentUser, xp: data.user.xp, streak: data.user.streak, activityLog: data.user.activityLog };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success(`🎉 +10 XP! Chuỗi học: ${data.user.streak} ngày 🔥`);
            
            window.dispatchEvent(new Event('userUpdated'));
        }

        setCompletedLessons(prev => [...new Set([...prev, currentLesson._id])]);

        if (hasNextLesson) {
            setTimeout(() => {
                fetchLessonContent(flatLessons[currentLessonIndexInFlat + 1].slug);
            }, 1000); 
        } else {
            toast.success("🏆 Chúc mừng bạn đã hoàn thành khóa học!");
        }
    } catch (error) {
        console.error("Lỗi lưu tiến độ:", error);
    }
  };

  const handlePrevClick = () => {
     if (hasPrevProblem) {
         setCurrentProblemIndex(prev => prev - 1);
     } else if (hasPrevLesson) {
         fetchLessonContent(flatLessons[currentLessonIndexInFlat - 1].slug);
     }
  };

  const filteredChapters = course?.chapters?.map(chapter => ({
      ...chapter,
      lessons: chapter.lessons.filter(lesson => 
          lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
  })).filter(chapter => chapter.lessons.length > 0);

  const renderTextContent = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    return blocks.map((block, index) => {
      switch (block.type) {
        case 'header':
          const Tag = `h${block.data.level}`;
          return <Tag key={index} style={{ marginTop: '24px', marginBottom: '16px' }} dangerouslySetInnerHTML={{ __html: block.data.text }}></Tag>;
        case 'paragraph':
          return <p key={index} style={{ lineHeight: '1.8', marginBottom: '16px', fontSize: '16px' }} dangerouslySetInnerHTML={{ __html: block.data.text }}></p>;
        case 'list':
          const isOrdered = block.data.style === 'ordered';
          const ListTag = isOrdered ? 'ol' : 'ul';
          const listType = isOrdered ? 'decimal' : 'disc'; 
          const renderListItems = (items) => {
            if (!items) return null;
            return items.map((item, i) => {
              const content = typeof item === 'string' ? item : item.content;
              const subItems = typeof item === 'object' && item.items ? item.items : [];
              return (
                <li key={i} style={{ marginBottom: '8px', listStyleType: listType }}>
                  <span dangerouslySetInnerHTML={{ __html: content }}></span>
                  {subItems.length > 0 && <ListTag style={{ paddingLeft: '20px', marginTop: '6px' }}>{renderListItems(subItems)}</ListTag>}
                </li>
              );
            });
          };
          return (
            <ListTag key={index} style={{ paddingLeft: '24px', marginBottom: '16px', lineHeight: '1.8', fontSize: '16px', listStyleType: listType, listStylePosition: 'outside' }}>
              {renderListItems(block.data.items)}
            </ListTag>
          );
        case 'code':
          return (
            <pre key={index} style={{ background: '#282c34', color: '#abb2bf', padding: '16px', borderRadius: '8px', overflowX: 'auto', marginBottom: '16px', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}>
              <code>{block.data.code}</code>
            </pre>
          );
        case 'quote':
          return (
            <blockquote key={index} style={{ borderLeft: '4px solid #fe215e', paddingLeft: '16px', color: '#555', fontStyle: 'italic', margin: '0 0 16px 0', backgroundColor: '#fef2f2', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
              <div dangerouslySetInnerHTML={{ __html: block.data.text }}></div>
              {block.data.caption && <cite style={{ display: 'block', marginTop: '8px', fontSize: '14px', fontWeight: 'bold' }}>- {block.data.caption}</cite>}
            </blockquote>
          );
        case 'image':
          return (
            <figure key={index} style={{ margin: '24px 0', textAlign: 'center' }}>
              <img 
                src={block.data.file?.url} 
                alt={block.data.caption || 'Image'} 
                style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
              />
              {block.data.caption && (
                <figcaption style={{ marginTop: '8px', fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>
                  {block.data.caption}
                </figcaption>
              )}
            </figure>
          );
        default:
          return null;
      }
    });
  };

  if (!course && loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><Spinner /></div>;

return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 66px)', overflow: 'hidden', backgroundColor: '#f8f9fa', paddingBottom: '60px', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
            {loading && currentLesson === null ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spinner /></div>
            ) : (
                currentLesson && (
                    currentLesson.type === 'coding' ? (
                        <div style={{ display: 'flex', height: '100%' }}>
                            <div className="editor-sidebar" style={{ width: '450px', minWidth: '400px', borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', backgroundColor: 'white', overflowY: 'auto' }}>
                                <div style={{ padding: '24px', flex: 1 }}>
                                    {lessonProblems.length > 1 && (
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                            {lessonProblems.map((prob, idx) => (
                                                <button
                                                    key={prob._id}
                                                    onClick={() => setCurrentProblemIndex(idx)}
                                                    style={{
                                                        padding: '6px 14px', borderRadius: '6px',
                                                        border: currentProblemIndex === idx ? 'none' : '1px solid #d1d5db',
                                                        backgroundColor: currentProblemIndex === idx ? '#f05123' : '#f9fafb',
                                                        color: currentProblemIndex === idx ? '#ffffff' : '#4b5563',
                                                        fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                                    }}
                                                >
                                                    Bài {idx + 1}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#292929', lineHeight: '1.3' }}>
                                            {currentProblem ? currentProblem.title : currentLesson.title}
                                        </h2>
                                        {currentProblem && (
                                            <span style={{ 
                                                fontSize: '12px', padding: '4px 10px', borderRadius: '12px', fontWeight: 600,
                                                backgroundColor: currentProblem.difficulty === 'Easy' ? '#d1fae5' : currentProblem.difficulty === 'Medium' ? '#fef3c7' : '#fee2e2',
                                                color: currentProblem.difficulty === 'Easy' ? '#059669' : currentProblem.difficulty === 'Medium' ? '#d97706' : '#dc2626',
                                                whiteSpace: 'nowrap', marginLeft: '12px'
                                            }}>
                                                {currentProblem.difficulty}
                                            </span>
                                        )}
                                    </div>

                                    {!currentProblem ? (
                                        <p style={{ color: '#777', fontStyle: 'italic' }}>Chưa có đề bài cho bài thực hành này. Vui lòng tạo trong trang Admin.</p>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#444', marginBottom: '24px' }}>
                                                <ReactMarkdown>{currentProblem.description}</ReactMarkdown>
                                            </div>
                                            
                                            {currentProblem.sampleTestCases && currentProblem.sampleTestCases.length > 0 ? (
                                                <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
                                                    <strong style={{ display: 'block', marginBottom: '12px', color: '#292929' }}>Ví dụ mẫu:</strong>
                                                    {currentProblem.sampleTestCases.map((tc, idx) => (
                                                        <div key={idx} style={{ fontFamily: 'monospace', fontSize: '14px', color: '#333', marginBottom: idx < currentProblem.sampleTestCases.length - 1 ? '16px' : '0', paddingBottom: idx < currentProblem.sampleTestCases.length - 1 ? '16px' : '0', borderBottom: idx < currentProblem.sampleTestCases.length - 1 ? '1px dashed #ccc' : 'none' }}>
                                                            <div style={{ color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>Input {idx + 1}:</div>
                                                            <div style={{ whiteSpace: 'pre-wrap', marginBottom: '12px', backgroundColor: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>{tc.input}</div>
                                                            <div style={{ color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>Output {idx + 1}:</div>
                                                            <div style={{ whiteSpace: 'pre-wrap', backgroundColor: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>{tc.expected}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                currentProblem.sampleInput && (
                                                    <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
                                                        <strong style={{ display: 'block', marginBottom: '12px', color: '#292929' }}>Ví dụ mẫu:</strong>
                                                        <div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#333' }}>
                                                            <div style={{ color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>Input:</div>
                                                            <div style={{ whiteSpace: 'pre-wrap', marginBottom: '16px', backgroundColor: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>{currentProblem.sampleInput}</div>
                                                            <div style={{ color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>Output:</div>
                                                            <div style={{ whiteSpace: 'pre-wrap', backgroundColor: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>{currentProblem.sampleOutput}</div>
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            {currentProblem.hints && (
                                                <div style={{ backgroundColor: '#e8f2ff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #1473e6', marginBottom: '20px' }}>
                                                    <div style={{ fontWeight: 600, color: '#1473e6', marginBottom: '4px' }}>💡 Gợi ý:</div>
                                                    <div style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                                                        <ReactMarkdown>{currentProblem.hints}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div style={{ marginTop: '20px', fontSize: '13px', color: '#888', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                                                ⏱ Time: <strong>{currentProblem.timeLimit}s</strong> &nbsp;|&nbsp; Memory: <strong>{currentProblem.memoryLimit}MB</strong>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <CodeEditor 
                                    key={currentProblem?._id || 'empty-editor'}
                                    lessonSlug={currentLesson.slug} 
                                    problem={currentProblem} 
                                    onSuccess={handleNextClick} 
                                />
                            </div>
                        </div>

                    ) : (
                        <div style={{ maxWidth: '1400px', padding: '40px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>{currentLesson.title}</h1>

                            {currentLesson.videoUrl && (
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', marginBottom: '24px' }}>
                                    <ReactPlayer 
                                        src={currentLesson.videoUrl} 
                                        controls={true}
                                        width="100%" 
                                        height="100%" 
                                        style={{ position: 'absolute', top: 0, left: 0 }}
                                        onTimeUpdate={unlockNextFromVideoProgress}
                                        config={{
                                            youtube: {
                                                showinfo: 1
                                            }
                                        }}
                                        fallback={<div>Loading video...</div>}
                                    />
                                </div>
                            )}

                            {currentLesson.content?.blocks && (
                                <div className="text-content">
                                    {renderTextContent(currentLesson.content.blocks)}
                                </div>
                            )}

                            {currentLesson.type === 'theory' && !completedLessons.includes(currentLesson._id) && (
                                <div style={{ marginTop: '40px', padding: '30px', borderTop: '1px solid #eee', textAlign: 'center', backgroundColor: '#fdfdfd', borderRadius: '12px' }}>
                                    <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '15px' }}>
                                        Bạn đã đọc xong và nắm vững kiến thức bài này chưa?
                                    </p>
                                    <button 
                                        onClick={() => setCanGoNext(true)}
                                        style={{ 
                                            padding: '12px 32px', backgroundColor: canGoNext ? '#10b981' : '#f05123', 
                                            color: 'white', border: 'none', borderRadius: '30px', 
                                            fontWeight: 'bold', cursor: 'pointer', fontSize: '16px',
                                            boxShadow: '0 4px 12px rgba(240, 81, 35, 0.2)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {canGoNext ? 'Đã hiểu, tiếp tục thôi!' : 'Đang ghi nhận tiến độ...'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                )
            )}
        </div>

        <div style={{ width: '320px', backgroundColor: 'white', borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', overflowY: 'auto', zIndex: 10 }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#f8fafc' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#0f172a' }}>{course?.title}</h2>
                
                <input 
                    type="text" 
                    placeholder="🔍 Tìm kiếm bài học..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                />
                
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '12px' }}>
                    Đã hoàn thành {completedLessons.length}/{totalLessons} bài học
                </div>
            </div>

            <div>
            {filteredChapters?.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Không tìm thấy bài học phù hợp.</div>
            ) : (
                filteredChapters?.map((chapter) => (
                <div key={chapter._id}>
                    <div style={{ backgroundColor: '#f1f5f9', padding: '12px 20px', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid #e0e0e0', color: '#334155' }}>
                    {chapter.title}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {chapter.lessons?.map((lesson) => {
                        const isActive = currentLesson?.slug === lesson.slug;
                        const isCompleted = completedLessons.includes(lesson._id);
                        
                        // Kiểm tra tiến độ để khóa/mở bài học
                        const lessonIndex = flatLessons.findIndex(l => l._id === lesson._id);
                        const isFirstLesson = lessonIndex === 0;
                        const isPrevCompleted = lessonIndex > 0 ? completedLessons.includes(flatLessons[lessonIndex - 1]._id) : true;
                        const isUnlocked = isFirstLesson || isCompleted || isPrevCompleted;

                        return (
                        <div 
                            key={lesson._id} 
                            onClick={() => {
                                if (isUnlocked) fetchLessonContent(lesson.slug);
                                else toast.error('Bạn phải hoàn thành bài học trước đó để mở khóa bài này!');
                            }}
                            style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 20px 12px 20px', cursor: isUnlocked ? 'pointer' : 'not-allowed', fontSize: '14px',
                            backgroundColor: isActive ? '#fff1f2' : (isCompleted ? '#d1fae5' : (isUnlocked ? 'white' : '#f8fafc')),
                            color: isActive ? '#e11d48' : (isCompleted ? '#065f46' : (isUnlocked ? '#334155' : '#94a3b8')),
                            borderBottom: '1px solid #f1f5f9',
                            borderLeft: isActive ? '4px solid #e11d48' : (isCompleted ? '4px solid #10b981' : '4px solid transparent'),
                            transition: 'all 0.2s',
                            opacity: isUnlocked ? 1 : 0.6
                            }}
                        >
                            <span style={{ paddingRight: '10px' }}>{lesson.title}</span>
                            {!isUnlocked && <span style={{ fontSize: '12px' }}>🔒</span>}
                        </div>
                        )
                    })}
                    </div>
                </div>
                ))
            )}
            </div>
        </div>
      </div>

      {isCommentOpen && (
          <div 
              onClick={() => setIsCommentOpen(false)} 
              style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: '60px',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 9998,
                  transition: 'opacity 0.3s ease'
              }}
          />
      )}

      {/* 🚀 FIXED: TAB COMMENT TRƯỢT */}
      <div style={{ 
          position: 'fixed', top: 0, bottom: '60px', 
          left: isCommentOpen ? 0 : '-450px', width: '450px', 
          backgroundColor: 'white', zIndex: 9999, transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
          boxShadow: '4px 0 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
      }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>💬 Thảo luận & Hỏi đáp</h3>
              <button onClick={() => setIsCommentOpen(false)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}>&times;</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
              {currentLesson && isCommentOpen && <CommentSection lessonId={currentLesson._id} />}
          </div>
      </div>

      <div style={{ 
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: '60px', backgroundColor: '#f8fafc', borderTop: '1px solid #cbd5e1', 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '0 20px', zIndex: 10000 
      }}>
            <div style={{ width: '200px' }}>
                <button 
                    onClick={() => setIsCommentOpen(prev => !prev)} 
                    style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                        backgroundColor: isCommentOpen ? '#0f172a' : '#fff', 
                        color: isCommentOpen ? 'white' : '#0f172a',
                        fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}
                    title="Mở khu vực Thảo luận"
                >
                    ?
                </button>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                    onClick={handlePrevClick} 
                    disabled={!hasPrevLesson && !hasPrevProblem}
                    style={{ 
                        padding: '8px 24px', borderRadius: '24px', fontWeight: 'bold', cursor: 'not-allowed',
                        backgroundColor: '#f1f5f9',
                        color: '#94a3b8'
                    }}
                >
                    &larr; BÀI TRƯỚC
                </button>

                <button 
                    onClick={handleNextClick} 
                    disabled={!canGoNext}
                    style={{ 
                        padding: '8px 24px', 
                        borderRadius: '24px', 
                        fontWeight: 'bold', 
                        border: 'none', 
                        cursor: canGoNext ? 'pointer' : 'not-allowed',
                        backgroundColor: canGoNext ? ((!hasNextLesson && !hasNextProblem) ? '#10b981' : '#f05123') : '#cbd5e1',
                        color: canGoNext ? '#fff' : '#64748b',
                        transition: 'all 0.2s',
                        boxShadow: canGoNext ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    {!canGoNext ? 'ĐANG HỌC...' : ((!hasNextLesson && !hasNextProblem) ? 'HOÀN THÀNH KHÓA HỌC 🏆' : 'BÀI TIẾP THEO \u2192')}
                </button>
            </div>

            <div style={{ width: '200px' }}></div>
      </div>
    </div>
  );
};
