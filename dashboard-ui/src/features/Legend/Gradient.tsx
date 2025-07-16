import styles from '@/features/Legend/Legend.module.css';

type Props = {
    colors: string[];
    from: string | number;
    to: string | number;
};

export const Gradient: React.FC<Props> = (props) => {
    const { colors, from, to } = props;
    const stepLength = 100 / colors.length;
    const coloration = colors.map(
        (color, index) =>
            `${color} ${stepLength * index}% ${stepLength * (index + 1)}%`
    );

    return (
        <div className={styles.gradientContainer}>
            <div
                className={styles.gradient}
                style={{
                    background: `linear-gradient(to right, ${coloration.join(
                        ', '
                    )})`,
                }}
            ></div>
            <div className={styles.gradientLabelContainer}>
                <span>{from}</span>
                <span>{to}</span>
            </div>
        </div>
    );
};
