import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-message',
  imports: [CommonModule, MarkdownModule, FontAwesomeModule],
  templateUrl: './message.html',
  styleUrl: './message.scss',
  host: {
    class: 'flex',
  },
})
export class Message {
  role = input<'user' | 'assistant'>('user');
  content = input<string>('');

  icons = {
    spinner: faSpinner,
  };
}
