import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import CodeTool from '@editorjs/code';
import Quote from '@editorjs/quote';
import ImageTool from '@editorjs/image';
import { uploadFile } from '../../../../services/admin.service';
import { BACKEND_URL } from '../../../../services/config';

export const RichTextEditor = ({ data, onChange }) => {
  const editorInstance = useRef(null);

  useEffect(() => {
    if (!editorInstance.current) {
      const editor = new EditorJS({
        holder: 'editorjs-container',
        placeholder: 'Nhấn Tab để chọn công cụ, hoặc bắt đầu gõ...',
        data: data || { time: Date.now(), blocks: [], version: "2.81.0" },
        tools: {
          header: { class: Header, inlineToolbar: true },
          list: { class: List, inlineToolbar: true },
          code: CodeTool,
          quote: { class: Quote, inlineToolbar: true },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file) {
                  try {
                    const res = await uploadFile(file);
                    return {
                      success: 1,
                      file: {
                        url: `${BACKEND_URL}${res.imageUrl}`
                      }
                    };
                  } catch (error) {
                    return {
                      success: 0,
                      message: 'Lỗi tải ảnh'
                    };
                  }
                }
              }
            }
          }
        },
        onChange: async () => {
          const savedData = await editor.saver.save();
          onChange(savedData);
        }
      });
      
      editorInstance.current = editor;
    }

    return () => {
      if (editorInstance.current && editorInstance.current.destroy) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []);

  return (
    <div 
      id="editorjs-container" 
      style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '20px', 
        minHeight: '400px', 
        backgroundColor: '#fff',
        color: '#333'
      }} 
    />
  );
};