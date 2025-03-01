
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CKEditorField: React.FC<CKEditorFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = 'Enter content here...',
  className,
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
        {label}
      </label>
      <CKEditor
        editor={ClassicEditor}
        data={value || ''}
        config={{
          placeholder,
          toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(name, data);
        }}
      />
    </div>
  );
};
