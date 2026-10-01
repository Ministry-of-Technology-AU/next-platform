import * as React from 'react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

export function Empty() {
  return <RichTextEditor value="" onChange={() => {}} placeholder="Type description here" />;
}

export function WithContent() {
  return (
    <RichTextEditor
      value={
        '<p>Ashoka University is a private liberal arts and sciences university located in ' +
        'Sonipat, Haryana, India.</p><p>We offer <strong>undergraduate</strong> and ' +
        '<em>postgraduate</em> programs across the humanities, sciences, and social sciences.</p>' +
        '<ul><li>Small class sizes</li><li>Interdisciplinary curriculum</li><li>Residential campus</li></ul>'
      }
      onChange={() => {}}
    />
  );
}
