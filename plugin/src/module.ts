import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { AIpromptPannel } from './components/AIpromptPannel';
import { CustomInput } from './components/CustomInput';
import './tailwind.css';

export const plugin = new PanelPlugin<SimpleOptions>(AIpromptPannel).setPanelOptions((builder) => {
  return builder
    .addCustomEditor({
      id: 'chatInput',
      path: 'userInput',
      name: '',
      editor: CustomInput,
      defaultValue: '',
    });
});

