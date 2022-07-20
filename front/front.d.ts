interface Window{
	app: HTMLDivElement
}

type HttpError = {
	message: string
	key: string
	path: string[]
	name: string
}

type MetaFields = import("./partial").MetaFields;

declare module '*.svg';


declare namespace NodeJS {
	interface ProcessEnv {
		ApiURL: string
		BugsnagKey: string
    ClientId: string
    ApiKey: string
	}
}