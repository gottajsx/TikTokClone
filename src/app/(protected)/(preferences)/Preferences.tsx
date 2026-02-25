import { ReactNode, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";

type SectionProps = {
    title: string;
    children?: ReactNode;
};

type OptionProps = {
    label: string;
    selected: boolean;
    onPress: () => void;
};

const Section = ({ title, children }: SectionProps) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const Option = ({ label, selected, onPress }: OptionProps) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.option, selected && styles.optionSelected]}
    >
        <Text
            style={[styles.optionText, selected && styles.optionTextSelected]}
        >
            {label}
        </Text>
    </TouchableOpacity>
);




export default function PreferencesScreen() {
    const [gender, setGender] = useState("Femme");
    const [lookingFor, setLookingFor] = useState(["Homme"]);
    const [orientation, setOrientation] = useState("Hétéro");
    const [intention, setIntention] = useState("Sérieux");
    const [distance, setDistance] = useState(30);
    const [ageMin, setAgeMin] = useState(23);
    const [ageMax, setAgeMax] = useState(35);

    const toggleMultiSelect = <T,>(
        value: T,
        setState: Dispatch<SetStateAction<T[]>>
    ): void => {
        setState((prev) =>
            prev.includes(value)
            ? prev.filter((v) => v !== value)
            : [...prev, value]
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {}}>
                        <Text style={styles.back}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Préférences</Text>
                </View>

                {/* GENRE UTILISATEUR */}
                <Section title="Ton genre">
                    {["Femme", "Homme", "Non-binaire"].map((item) => (
                        <Option
                            key={item}
                            label={item}
                            selected={gender === item}
                            onPress={() => setGender(item)}
                        />
                    ))}
                </Section>

                {/* GENRES RECHERCHÉS */}
                <Section title="Tu recherches">
                    {["Femme", "Homme", "Non-binaire"].map((item) => (
                        <Option
                        key={item}
                        label={item}
                        selected={lookingFor.includes(item)}
                        onPress={() =>
                            toggleMultiSelect(item, setLookingFor)
                        }
                        />
                    ))}
                </Section>

                {/* ORIENTATION */}
                <Section title="Orientation">
                    {["Hétéro", "Gay", "Bi", "Autre"].map((item) => (
                        <Option
                        key={item}
                        label={item}
                        selected={orientation === item}
                        onPress={() => setOrientation(item)}
                        />
                    ))}
                </Section>

                {/* INTENTIONS */}
                <Section title="Intentions">
                    {["Sérieux", "Rencontres", "Fun", "Je ne sais pas"].map((item) => (
                        <Option
                        key={item}
                        label={item}
                        selected={intention === item}
                        onPress={() => setIntention(item)}
                        />
                    ))}
                </Section>

                {/* DISTANCE */}
                <Section title={`Distance max : ${distance} km`}>
                    <Slider
                        minimumValue={1}
                        maximumValue={100}
                        value={distance}
                        onValueChange={setDistance}
                    />
                </Section>

                {/* ÂGE */}
                <Section title={`Âge : ${ageMin} - ${ageMax}`}>
                    <Text style={styles.sliderLabel}>Âge minimum</Text>
                    <Slider
                        minimumValue={18}
                        maximumValue={ageMax}
                        value={ageMin}
                        onValueChange={setAgeMin}
                    />
                    <Text style={styles.sliderLabel}>Âge maximum</Text>
                    <Slider
                        minimumValue={ageMin}
                        maximumValue={80}
                        value={ageMax}
                        onValueChange={setAgeMax}
                    />
                </Section>

                 <View style={{ height: 40 }} />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    back: {
        fontSize: 20,
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    section: {
        marginTop: 28,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
    },
    option: {
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 8,
    },
    optionSelected: {
        backgroundColor: "#000",
        borderColor: "#000",
    },
    optionText: {
        fontSize: 15,
    },
    optionTextSelected: {
        color: "#fff",
        fontWeight: "600",
    },
    sliderLabel: {
        fontSize: 13,
        color: "#666",
        marginTop: 8,
    },
});