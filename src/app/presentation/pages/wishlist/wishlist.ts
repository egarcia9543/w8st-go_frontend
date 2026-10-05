import { Component, computed, inject, LOCALE_ID, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideExternalLink,
  lucidePencil,
  lucidePlus,
  lucideRotateCcw,
  lucideTrash2,
  lucideX,
} from '@ng-icons/lucide';
import { map, startWith } from 'rxjs';
import { Currency } from '../../../domain/entities/transaction.entity';
import {
  IMPULSE_COOLDOWN_DAYS,
  WISHLIST_TIER_COLORS,
  WishlistItem,
  WishlistItemDraft,
  WishlistStatus,
  WishlistTier,
} from '../../../domain/entities/wishlist.entity';
import { WishlistFacade } from '../../facades/wishlist.facade';
import { formatMoney } from '../../pipes/format-money';

interface ItemView {
  item: WishlistItem;
  priceLabel: string;
  ageLabel: string;
  cooledDown: boolean;
  initial: string;
}

interface TierView {
  tier: WishlistTier;
  items: ItemView[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HTTP_URL = /^https?:\/\/\S+$/i;

@Component({
  selector: 'app-wishlist',
  imports: [
    CdkDrag,
    CdkDragPlaceholder,
    CdkDropList,
    CdkDropListGroup,
    DatePipe,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmSheetImports,
    HlmSkeletonImports,
    NgIcon,
    ReactiveFormsModule,
  ],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
  providers: [
    provideIcons({
      lucideCheck,
      lucideExternalLink,
      lucidePencil,
      lucidePlus,
      lucideRotateCcw,
      lucideTrash2,
      lucideX,
    }),
  ],
})
export class Wishlist {
  protected readonly facade = inject(WishlistFacade);
  private readonly locale = inject(LOCALE_ID);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly statuses = WishlistStatus;
  protected readonly currencies = [Currency.COP, Currency.USD];
  protected readonly tierColors = WISHLIST_TIER_COLORS;
  protected readonly cooldownDays = IMPULSE_COOLDOWN_DAYS;
  protected readonly skeletonRows = [0, 1, 2];
  protected readonly statusTabs = [
    { status: WishlistStatus.WANTED, label: 'Lo quiero' },
    { status: WishlistStatus.BOUGHT, label: 'Comprados' },
    { status: WishlistStatus.DISCARDED, label: 'Descartados' },
  ];

  protected readonly formOpen = signal(false);
  protected readonly editingItem = signal<WishlistItem | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly failedImages = signal<ReadonlySet<string>>(new Set());
  protected readonly previewFailed = signal(false);
  protected readonly confirmingDeleteId = signal<string | null>(null);

  protected readonly editingTierId = signal<string | null>(null);
  protected readonly tierColor = signal<string>(WISHLIST_TIER_COLORS[0]);
  protected readonly tierLabel = this.formBuilder.nonNullable.control('', [
    Validators.required,
    Validators.maxLength(40),
  ]);

  protected readonly form = this.formBuilder.nonNullable.group({
    tierId: ['', Validators.required],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    currency: [Currency.COP],
    productUrl: ['', Validators.pattern(HTTP_URL)],
    imageUrl: ['', Validators.pattern(HTTP_URL)],
    notes: ['', Validators.maxLength(1000)],
  });

  protected readonly imagePreview = toSignal(
    this.form.controls.imageUrl.valueChanges.pipe(
      startWith(this.form.controls.imageUrl.value),
      map((value) => (HTTP_URL.test(value.trim()) ? value.trim() : null)),
    ),
    { initialValue: null },
  );

  protected readonly isWanted = computed(() => this.facade.status() === WishlistStatus.WANTED);

  protected readonly tiers = computed(() => this.facade.state().wishlist?.tiers ?? []);

  protected readonly counts = computed(
    () =>
      this.facade.state().wishlist?.counts ?? {
        [WishlistStatus.WANTED]: 0,
        [WishlistStatus.BOUGHT]: 0,
        [WishlistStatus.DISCARDED]: 0,
      },
  );

  protected readonly tierViews = computed<TierView[]>(() => {
    const now = Date.now();
    return this.tiers().map((tier) => ({
      tier,
      items: tier.items.map((item) => this.toView(item, now)),
    }));
  });

  protected readonly visibleTierViews = computed(() =>
    this.isWanted() ? this.tierViews() : this.tierViews().filter((view) => view.items.length > 0),
  );

  protected readonly isEmpty = computed(() =>
    this.tierViews().every((view) => view.items.length === 0),
  );

  constructor() {
    this.facade.load(WishlistStatus.WANTED);
  }

  selectStatus(status: WishlistStatus): void {
    if (status === this.facade.status()) return;
    this.confirmingDeleteId.set(null);
    this.facade.load(status);
  }

  openCreate(tierId?: string): void {
    this.editingItem.set(null);
    this.formError.set(null);
    this.previewFailed.set(false);
    this.form.reset({
      tierId: tierId ?? this.tiers()[0]?.id ?? '',
      name: '',
      price: null,
      currency: Currency.COP,
      productUrl: '',
      imageUrl: '',
      notes: '',
    });
    this.formOpen.set(true);
  }

  openEdit(item: WishlistItem): void {
    this.editingItem.set(item);
    this.formError.set(null);
    this.previewFailed.set(false);
    this.form.reset({
      tierId: item.tierId,
      name: item.name,
      price: item.price,
      currency: item.currency,
      productUrl: item.productUrl ?? '',
      imageUrl: item.imageUrl ?? '',
      notes: item.notes ?? '',
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  onSheetStateChange(state: string): void {
    if (state === 'closed') this.formOpen.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const draft: WishlistItemDraft = {
      name: raw.name.trim(),
      price: raw.price ?? 0,
      currency: raw.currency,
      productUrl: this.blankToNull(raw.productUrl),
      imageUrl: this.blankToNull(raw.imageUrl),
      notes: this.blankToNull(raw.notes),
    };

    const editing = this.editingItem();
    const request = editing
      ? this.facade.updateItem(editing.id, draft)
      : this.facade.createItem(raw.tierId, draft);

    this.formError.set(null);
    request.subscribe({
      next: (item) => {
        this.forgetFailedImage(item.id);
        this.formOpen.set(false);
      },
      error: () => this.formError.set('No se pudo guardar. Revisa los datos e intenta de nuevo.'),
    });
  }

  onDrop(event: CdkDragDrop<WishlistTier, WishlistTier, WishlistItem>): void {
    const sameSpot =
      event.previousContainer === event.container && event.previousIndex === event.currentIndex;
    if (sameSpot) return;

    this.facade.moveItem(event.item.data.id, event.container.data.id, event.currentIndex);
  }

  setStatus(item: WishlistItem, status: WishlistStatus): void {
    this.facade.setStatus(item, status);
  }

  requestDelete(item: WishlistItem): void {
    if (this.confirmingDeleteId() !== item.id) {
      this.confirmingDeleteId.set(item.id);
      return;
    }

    this.confirmingDeleteId.set(null);
    this.facade.deleteItem(item);
  }

  startTierEdit(tier: WishlistTier): void {
    this.editingTierId.set(tier.id);
    this.tierColor.set(tier.color);
    this.tierLabel.reset(tier.label);
  }

  cancelTierEdit(): void {
    this.editingTierId.set(null);
  }

  saveTier(tierId: string): void {
    if (this.tierLabel.invalid || !this.tierLabel.value.trim()) {
      this.tierLabel.markAsTouched();
      return;
    }

    this.facade
      .updateTier(tierId, { label: this.tierLabel.value.trim(), color: this.tierColor() })
      .subscribe({ next: () => this.editingTierId.set(null) });
  }

  markImageFailed(itemId: string): void {
    this.failedImages.update((failed) => new Set(failed).add(itemId));
  }

  private forgetFailedImage(itemId: string): void {
    this.failedImages.update((failed) => {
      const next = new Set(failed);
      next.delete(itemId);
      return next;
    });
  }

  private blankToNull(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private toView(item: WishlistItem, now: number): ItemView {
    const days = Math.max(0, Math.floor((now - new Date(item.createdAt).getTime()) / DAY_MS));

    return {
      item,
      priceLabel: formatMoney(item.price, item.currency, this.locale),
      ageLabel: days === 0 ? 'Agregado hoy' : days === 1 ? 'Hace 1 día' : `Hace ${days} días`,
      cooledDown: days >= IMPULSE_COOLDOWN_DAYS,
      initial: item.name.trim().charAt(0).toUpperCase() || '?',
    };
  }
}
