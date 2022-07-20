import React from "react";



export const Token = React.createContext<string>(undefined as any);

export function useRelayErrors(){
	const [errors, setErrors] = React.useState<HttpError[]>([]);
	const _errs =  React.useMemo(
		function () {
			return (
				errors.reduce(
					function (ac, error) {
						let pt = error.path.slice(1).toString();
						ac[ pt ] = error.message;
						return ac;
					},
					{} as {[key: string]: string}
				)
			)
		},
		[errors]
	);
	function onError(err: any){
		setErrors(err.errors || []);
	}
	return [
		onError,
		_errs,
		setErrors,
		errors
	] as const;
}