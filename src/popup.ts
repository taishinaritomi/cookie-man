import './style.css';
import { render } from 'solid-js/web';
import { PopupView } from './app/Popup/View';

render(PopupView, document.getElementById('app') as HTMLDivElement);
