import "./CheckBox.css";

interface CheckBoxProps {
	label: string;
	isChecked: boolean;
	setIsChecked: (isChecked: boolean) => void;
}

const CheckBox: React.FC<CheckBoxProps> = ({ label, isChecked, setIsChecked }) => {

	return (
		<div className="PixelArtCheckbox">
			<label>
				<input type="checkbox" checked={isChecked} onChange={() => setIsChecked(!isChecked)}/>
				<span className="PixelArtCheckbox-checkmark">{isChecked && <span className="PixelArtCheckbox-checkmark-icon"></span>}</span>
				{label}
			</label>
		</div>
	);
}

export default CheckBox;