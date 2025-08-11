import { Component, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-number-card',
  imports: [SkeletonModule],
  templateUrl: './number-card.component.html',
  styleUrl: './number-card.component.scss'
})
export class NumberCardComponent {
  title = input<string | number>();
  value = input<string | number>();

  loading = input<boolean>(false);
}
