import * as React from "react";

export type IconProps = {
    color: string;
};

export class ToolBoxUpload extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 13.4766C0 14.3174 0.651367 15 1.45459 15H14.5454C15.3486 15 16 14.3174 16 13.4766V3.04785C16 2.49512 15.5522 2.04785 15 2.04785H8.39575C8.1416 2.04785 7.89673 1.95117 7.71143 1.77637L6.10669 0.270508C5.92139 0.0966797 5.67676 0 5.42236 0H1C0.447754 0 0 0.447266 0 1V13.4766ZM8.69995 5.33301C8.69995 4.94629 8.38672 4.63281 8 4.63281C7.61353 4.63281 7.30005 4.94629 7.30005 5.33301V11.3994C7.30005 11.7861 7.61353 12.0996 8 12.0996C8.38672 12.0996 8.69995 11.7861 8.69995 11.3994V5.33301Z"
                    fill={this.props.color}/>
                <path
                    d="M0 2.83111L2.625 0L5.25 2.83111"
                    transform="translate(5.37524 5.33301)"
                    fill="white"/>
                <path
                    d="M0 2.83111L2.625 0L5.25 2.83111H0Z"
                    transform="translate(5.37524 5.33301)"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"/>
            </svg>
        );
    }
}
