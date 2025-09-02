<template>
    <VuijCtrl
        :for="id"
        :label="label"
        :ctrlClass="ctrlClass"
        :error="error"
        :loading="loading"
        @paste="pasteLabel" 
        @drop.prevent="dropLabel" 
        @dragover.prevent
        @dragleave.prevent="dragenter=false" 
        @dragenter.prevent="dragenter=true"
    >
        <template v-if="$slots.label" #label="labelSlotProps">
			<slot name="label" :label="labelSlotProps.label" :for="labelSlotProps.for"></slot>
		</template>

        <template v-if="$slots.prepend" #prepend>
			<slot name="prepend"></slot>
		</template>
        <input type="file" 
                ref="input" 
                :id="id" 
                :name="inputName" 
                :form="form" 
                :accept="accept" 
                :multiple="multiple"
                :required="required" 
                :hidden="hideInput"
                @change="changeFiles"
        />

        <VuijLoading :svgStyle="loaderStyle">
            <slot name="previews" :previews="previews">
                <div v-if="!loading" style="display: flex;gap: 1em;flex-wrap: wrap;">
                    <template v-for="(preview,px) in previews" :key="'preview'+px">
                        <div style="position: relative;width: 100px;height: 100px;" :title="preview.name">

                            <object 
                                style="width: 100px;height: 100px;border: 0;object-fit: cover;position:absolute;top:0;z-index:0;font-size:10px;" 
                                :data="preview.src" 
                                :type="preview.type"
                            >
                                {{ preview.name }}
                                <br/>
                                <br/>
                                {{ preview.type }}
                            </object>

                            <span v-if="preview.id===null" class="close" @click="close(preview.ix)"></span>
                            <label v-else class="close">
                                <input 
                                    v-if="preview.id!==null" 
                                    :id="'unlink_'+px" 
                                    type="checkbox" 
                                    class="vuij-unlink-checkbox" 
                                    style="position:absolute;top:0.2em;right:0.2em;visibility:hidden;"
                                    :value="preview.id" 
                                    :name="unlinkNameComputed" 
                                    :data-name="`unlink[${preview.id}]`" 
                                    :data-model="unlink"
                                />
                            </label>
                        </div>
                    </template>
                </div>
            </slot>
        </VuijLoading>
        
        <label v-if="hasPlaceholder" :for="id" :class="[{'vuij-file__placeholder_dragenter': dragenter}, 'vuij-file__placeholder']">
            <slot>
                <span v-if="placeholder">{{ placeholder }}</span>
            </slot>
        </label>


        <template v-if="$slots.append" #append>
			<slot name="append"></slot>
		</template>

    </VuijCtrl>
</template>

<script>
const uniqueId = x => x;
const buildClass = x => x??'';
//import uniqueId from '../utils/uniqueId.js';
//import { buildClass } from '../utils/form.js';
import VuijCtrl from './VuijCtrl.vue';
import VuijLoading from './VuijLoading.vue';

export default {
    name: 'VuijFile',

    props: {
        name: {
			type: String,
			default: "vuij-file",//null
		},
		form: {
			type: String,
			default: undefined,
		},
        accept: {
            type: String,
            default: '*/*',//'application/pdf,image/*',//'*/*',//'image/*',
            //validator
        },
        //mode? avatar?

		// value: {
		// 	type: String,
		// 	default: null,
		// },
		// modelValue: {
		// 	// type: [Boolean, Number, String, Array, Object],
		// 	default: undefined,
		// },
        attachments: {
            // type: [String, Boolean, Array, Object],
            type: Array,
            default: ()=>([]),
        },

        files: {
            type: FileList,
            // type: Object,
            default: null,
            // validator: (fl)=>(fl instanceof FileList),
        },


		placeholder: {
			type: String,
			default: null,//"📎",//"",//
		},
		required: {
			type: Boolean,
			default: null,
		},
        //size, min, max, disabled
		
		id: {
			type: String,
			default() {
				return uniqueId("_vuij_input_");
			},
		},
        class: {
			type: String,
			default: "",
		},
		label: {
			type: String,
			default: null,
		},

		loaderStyle: {
			type: String,
			default: undefined,
		},
        unlinkName: {
			type: String,
			default: "unlink",//null
		},
        unlinkKey: {
			type: String,
			default: null,
		},
		// inputClass: {
		// 	type: [Object, Array, String],
		// 	default: "",
		// },
		// inputStyle: {
		// 	type: String,
		// 	default: "",
		// },

        
		error: {
			type: [Array, String],
			default: "",
		},
		// loading: {
		// 	type: Boolean,
		// 	default: false,
		// },

		unsetInput: {
			type: Boolean,
			default: !true,
		},

        multiple: {
            type: Boolean,
            default: false,
        },
		caption: {
			type: Boolean,
			default: true,
		},
		rounded: {
			type: Boolean,
			default: false,
		},
		shaking: {
			type: Boolean,
			default: true,
		},
    },

    components: {
        VuijCtrl,
        VuijLoading,
    },

    computed: {
        inputName(){
            return this.multiple ? (this.name.indexOf('[')>-1?this.name:this.name+"[]") : this.name;
        },
        hasPreview() {
            return !!this.previews?.length;
        },
        hasPlaceholder() {
            return !!this.placeholder || this.$slots.default;
        },
        hideInput() {
            return this.unsetInput;// && (this.hasPlaceholder || this.$slots.previews); // || this.$slots.label || this.label);
        },
        ctrlClass() {
            let _classes = buildClass(["vuij-ctrl_file"], this.class);
            if(this.dragenter) _classes.push('vuij-ctrl_dragenter');
            if(this.hasPreview) _classes.push('vuij-ctrl_preview');
            if(this.rounded) _classes.push('vuij-ctrl_rounded');
			return _classes;
		},
        unlinkNameComputed() {
            // return `unlink[${this.name}]`;
            return this.unlinkName + `[${this.unlinkKey || this.name}]`;
        },
    },

    data() {
        return {
            previews: undefined,// see initPreviews
            unlink: [],
            // ignore: [],//safari 13 ?
            dragenter: false,
            loading: false,
        }
    },

    emits: ['change', 'unlink', 'cancel'],

    methods: {
        resetPreviews() {
            this.previews = !this.multiple ? [] : [...this.previews].filter(p => p.id!==null);
        },

        loadFileAsPromise(file, ix = null) {
            const reader = new FileReader();
            return new Promise(resolve => {
                reader.onload = (_e) => {
                    const {name, type, size, lastModified, lastModifiedDate} = file,
                        isImage = String(type).startsWith('image/');
                    resolve({src: _e.target.result, id: null, ix, name, type, size, lastModified, lastModifiedDate, isImage});
                }
                reader.readAsDataURL(file)
            });
        },
     
        async createPreviews(files, event) {

            this.resetPreviews();// @TODO: or not and check count files ?
            this.loading = true;

            if(files.length) {
                const promises = [];
                [...files].forEach((file, ix) => {
                    promises.push(this.loadFileAsPromise(file, ix));
                });
                const previews = await Promise.all(promises);
                this.previews = this.previews.concat(previews);//
            }

            this.loading = false;
            
            this.$emit('change', event, [...this.previews], [...this.unlink]);
        },
        
        async initPreviews(attachments) {
            // performance.mark('start initPreviews');

            attachments = attachments.filter(a => !!a);
            
            if(Array.isArray(attachments)) {
                const promises = [];
                [...attachments].forEach((attach, ax) => {
                    if(Object(attach).constructor===String) attach = {src: attach};
                    if(Object(attach).constructor===Object) {
                        //if(attach.id===undefined) attach.id = uniqueId(ax);
                        if(attach.id===undefined) attach.id = attach.src;
                        if(attach.ix===undefined) attach.ix = ax;
                        // if(attach.src===undefined) attach.src = attach[this.srcKey];
                        if(!attach.name && attach.caption) attach.name = attach.caption;
                    }

                    //@TODO performance ?

                    const img = new Image();
                    img.src = attach.src;
                    promises.push(
                        img.decode()
                            .then(() => {
                                return {...attach, isImage: true};
                            })
                            .catch(() => {
                                return Object.assign(attach, {isImage: false});
                            })
                    );
                    
                });
                this.previews = await Promise.all(promises);
            }
            else {
                this.previews = [];
            }

        }, 

        spliceFileList(start, deleteCount, ...addingFiles) {
            // @TODO safari 13 ?
            const dt = new DataTransfer(),
                input = this.$refs.input,
                files = [...input.files],
                adding = addingFiles?.length ? [...addingFiles].filter(f => f instanceof File) : [];
            files.splice(start, deleteCount===undefined ? files.length-start : deleteCount, ...adding);
            files.forEach(file => dt.items.add(file));

            input.files = dt.files;
            return input.files;
        },

        setFiles(files, event) {
            // if !this.multiple && this.hasPreviews -> reset
            if(files instanceof FileList) {
                this.$refs.input.files = files;
                if(!this.multiple) files = this.spliceFileList(1);//0?
            }
            this.createPreviews(files, event);
        },
        
        pasteLabel(event) {
            this.setFiles(event.clipboardData?.files, event);
        },

        dropLabel(event) {
            this.setFiles(event.dataTransfer?.files, event);
        },

        changeFiles(event) {
            this.setFiles(event.srcElement.files, event);
            // this.$emit('change', event, [...this.previews], [...this.unlink]);
        },

        close(x) {
            const ix = this.previews.findIndex(p => p.ix===x),
                files = this.spliceFileList(ix, 1);
            
            this.createPreviews(files);

            this.$emit('cancel', files);
        },
    },

    created() {
        this.initPreviews(this.attachments);
    },

    mounted() {
        if(this.form) this.$refs.input.setAttribute('form', this.form);
        if(this.$refs.input.form && this.form!==null) {
            this.$refs.input.form.enctype = "multipart/form-data"; // method?
        }
    },

    watch: {
        files() {
            this.setFiles(this.files);
        },


        unlink() {
            
            if(Array.isArray(this.unlink) && this.unlink.length) {
                this.unlink.forEach(unlinkSrc => {
                    const ix = this.previews.findIndex(p => p.id===unlinkSrc),
                        files = this.spliceFileList(ix, 1);
                    
                    //this.createPreviews(files);
                });
            }
            this.$emit('unlink', this.unlink);
        },

        attachments() {
            this.initPreviews(this.attachments);
        },
        
        // previews(previews, oldValue) {
        //     if(oldValue!==undefined) {
        //         
        //         this.$emit('change', [...previews], [...this.unlink]);// @TODO event?
        //     }
        //     // else 
        // }
    }
    
}
</script>