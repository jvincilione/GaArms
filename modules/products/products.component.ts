import { Component, OnInit, Input, OnChanges, SimpleChange } from 'angular2/core';
import { NgForm } from 'angular2/common';
import { ProductsService } from './products.service';

@Component({
    directives: [],
    providers: [ ProductsService ],
    selector: 'products',
    templateUrl: '/modules/products/products.tpl.html'
})

class ProductsComponent implements OnInit, OnChanges {
    bullets:Array<any>;
    primers:Array<any>;
    brass:Array<any>;
    powder:Array<any>;
    visibleProducts:Array<any>;
    searchTerm:string;
    sortBy:string;
    updateQuantity:number;
    initial:string;
    modalType:string;
    selectedProduct:any;
    error:any = {};
    reportData:any = null;
    timeframe:string;

    @Input() currentProductType:string; // bullets, primers, brass, powder
    @Input() brandFilter:string;
    @Input() productsChanged:boolean;

    constructor(private _productsService:ProductsService) {
    }

    ngOnInit() {
        this._initialize();
    }

    ngOnChanges(changes: any) {
        let filter = changes.brandFilter && changes.brandFilter.currentValue;
        let currentProductType = changes.currentProductType && changes.currentProductType.currentValue;
        let changed = changes.productsChanged && changes.productsChanged.currentValue;
        if (typeof filter !== 'undefined') {
            this.brandFilter = filter;
            this.filter();
        }
        if (typeof currentProductType !== 'undefined') {
            this.visibleProducts = this._getProductsByType();
            if (this.brandFilter) {
                this.filter();
            }
            if (this.searchTerm) {
                this.search();
            }
        }
        if (changed === 'Add' || changed === 'Delete') {
            this._initialize();
            this.productsChanged = null;
        }
    }

    filter() {
        let filter = this.brandFilter;
        let products = this._getProductsByType();
        let visible = products.filter((bullet) => {
            return bullet.brandName === filter || filter === '' || filter === 'All';
        });
        if (visible.length) {
            this.visibleProducts = visible;
        }
        else {
            this.visibleProducts = [];
        }
    }

    search() {
        let filter = this.searchTerm;
        if (filter === '' && this.brandFilter !== '' && typeof this.brandFilter !== 'undefined') {
            this.filter();
        } else {
            filter = filter ? filter.toLowerCase() : '';
            let products = this._getProductsByType();
            let visible = products.filter((prod) => {
                return prod.brandName.toLowerCase().indexOf(filter) > -1 ||
                       prod.productName.toLowerCase().indexOf(filter) > -1 ||
                       filter === '';
            });
            if (visible.length) {
                this.visibleProducts = visible;
            }
            else {
                this.visibleProducts = [];
            }
        }
    }

    showModal(prod, type) {
        this.modalType = type;
        this.selectedProduct = prod;
    }

    closeModal() {
        this.modalType = null;
        this.updateQuantity = 0;
        this.initial = '';
        this.selectedProduct = null;
        this.reportData = null;
    }

    updateProduct() {
        let modalType = this.modalType;
        if (modalType === 'Add') {
            this._productsService.updateProduct(
                this.selectedProduct.id_product, 
                parseInt(this.selectedProduct.quantity) + this.updateQuantity,
                this.initial,
                this.updateQuantity,
                this.currentProductType
            ).subscribe(this._updateCallback(response));
        } 
        else if (modalType === 'Remove') {
            this._productsService.updateProduct(
                this.selectedProduct.id_product, 
                parseInt(this.selectedProduct.quantity) - this.updateQuantity,
                this.initial,
                -this.updateQuantity,
                this.currentProductType
            ).subscribe(this._updateCallback(response));
        }
    }

    generateReport() {
        this.modalType = null;
        this._productsService.generateReport(this.selectedProduct.id_product, this.timeframe)
            .subscribe((response) => {
                let reportLog = {
                    productName: response[0].productName,
                    net: 0,
                    totalAdded: 0,
                    totalRemoved: 0,
                    logs: response
                };
                for (let log of response) {
                    reportLog.totalAdded += parseInt(log.added);
                    reportLog.totalRemoved += parseInt(log.removed);
                    if (log.added) {
                        reportLog.net += parseInt(log.added);
                    } else {
                        reportLog.net -= parseInt(log.removed);
                    }
                }
                this.reportData = reportLog;
            });
    }

    dismissError() {
        this.error = {};
    }

    _initialize() {
        this._productsService.getBullets()
            .subscribe((response) => {
                this.bullets = response;
                this.visibleProducts = response;
                this.currentProductType = 'Bullets';
            });
        this._productsService.getPrimers()
            .subscribe((response) => {
                this.primers = response;
            });
        this._productsService.getBrass()
            .subscribe((response) => {
                this.brass = response;
            });
        this._productsService.getPowder()
            .subscribe((response) => {
                this.powder = response;
            });
    }

    _updateCallback(response) {
        if (response === 'success') {
            this.selectedProduct.quantity = parseInt(this.selectedProduct.quantity) + this.updateQuantity;
            this.closeModal();   
        }
        else {
            this.error.message = response;
        }
    }

    _getProductsByType() {
        let products;
        switch (this.currentProductType) {
            case 'Bullets':
                products = this.bullets;
                break;
            case 'Primers':
                products = this.primers;
                break;
            case 'Brass':
                products = this.brass;
                break;
            case 'Powder':
                products = this.powder;
                break;
            default:
                products = this.bullets;
        }
        return products;
    }
}

export { ProductsComponent };
