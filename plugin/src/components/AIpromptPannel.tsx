import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

export const AIpromptPannel: React.FC<Props> = ({ width, height }) => {

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className="pannel_body_container"
    >
      <h1 className="text-xl font-semibold mb-4">Chatbot Panel</h1>
      <div className="pannel_body" style={{ maxHeight: height - 60 }}>
          <p>Add your prompt in the chat panel and get results!!</p>
      </div>
    </div>
  );
};
      
