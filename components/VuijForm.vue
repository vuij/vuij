<template>
	<form
		ref="form"
		:id="id"
		class="vuij-form"
		:data-disabled="disabled"
		data-invalid="formInvalid"
		@reset="$emit('reset', $event)"
		@input="$emit('input', $event)"
		@change="formChange"
		@submit="formSubmit"
	>
		<slot></slot>
		<!-- <template v-if="(submitText || resetText) && !hasBtns">
			<div class="vuij-btns vuij-btns_autobtn">
				<button v-if="resetText" type="reset" class="vuij-btn">{{ 'reset' }}</button>
				<button v-if="submitText" type="submit" class="vuij-btn" :disabled="disabled">{{ submitText }}</button>
			</div>
		</template> -->
	</form>
</template>

<script>
import uniqueId from '../utils/uniqueId.js';
// import { get } from '../utils/object.js';

export default {
	name: 'VuijForm',

	props: {
		id: {
			type: String,
			default() {
				return uniqueId("_vuij_form_");
			},
		},
		// resetText: {
		// 	type: String,
		// 	default: null,
		// },
		// submitText: {
		// 	type: String,
		// 	default: null,
		// },
		disabled: {
			type: Boolean,
			default: null,
		},
		strict: {
			type: Boolean,
			default: false,
		},
		
	}, //, 'method', 'action',  'i18n'

	computed: {
		hasBtns() {
			return !!this.controls?.filter(c => c.type==='submit'||c.type==='button')?.length;
		},
	},


	methods: {
		getFormObject(form, strict) {
			const data = new FormData(form), 
                params = new URLSearchParams(data),
                query = strict 
						? Object.fromEntries([...params.entries()].filter(([k, v]) => !!String(v).trim())) 
						: Object.fromEntries(params.entries()),
                search = strict 
						? Object.keys(query).reduce((a,k)=>{a.push(k+'='+encodeURIComponent(query[k]));return a},[]).join('&')
						: params.toString(),
                body = JSON.stringify(query);
			return { form, data, params, search, query, body, strict };
		},

		formChange(e) {
			const form = e.target?.form,//||this.$refs.form
				obj = this.getFormObject(form, this.strict);

			
			e.target?.setCustomValidity('');

			this.$emit('change', e, obj, this.disabled);//||this.$refs.form; 
		},

		checkValidity() {
			/*
			const form = this.$refs.form;
			if(form instanceof HTMLFormElement && !form.checkValidity()) {
				
				const invalidInput = this.$$(':invalid', form);
				if(invalidInput) {
					invalidInput.scrollIntoView({block: "center", behavior: "smooth"});
					// if(invalidInput.validity.customError) {
						// invalidInput.reportValidity();
					// }
					// if(!invalidInput.validity.valid) 
					invalidInput.focus();
					
				}
			}
			*/
		},

        formInvalid(e) {
			e.preventDefault(); 
			
			// this.checkValidity();
			// const form = e.target?.form,//||this.$refs.form
			// this.$emit('invalid', e, this.getFormObject(form, this.strict), this.disabled);//||this.$refs.form; 
        },

		formSubmit(e) {
			e.preventDefault();//if?

			const form = this.$refs.form,//||e.target?.form
				obj = this.getFormObject(form, this.strict);
			
			// form.dataset.submit = "1";
			// setTimeout(()=>{form.dataset.submit="";}, 100);

			/*
			this.$nextTick(() => {
				setTimeout(() => {
					const errorCntrls = this.$$.$('[data-error]:not([data-error=""])', form);
					if(errorCntrls) {
						[...errorCntrls].forEach(ctrl => {
							const error = ctrl.dataset.error,
								input = this.$$('.vuij-input', ctrl);
							
							if(error && input instanceof HTMLInputElement) {
								
								input.setCustomValidity(error);
								// if(error) input.reportValidity();
							}
						});
					}
					this.checkValidity();
				}, 800);
			});
			*/

			this.$emit('submit', e, obj, this.disabled);
		},
	},

	emits: ["change", "input", "reset", "submit", "invalid"],

	mounted() {
		this.$nextTick(() => {
			this.checkValidity();
		});
	},
}
</script>