import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMyProfile } from '@/hooks/useProfile';
import { useMyPreferences } from '@/hooks/usePreferences';
import { RelationshipType } from '@/types/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const GENDER_LABELS: Record<string, string> = {
  male: 'Homme',
  female: 'Femme',
  'non-binary': 'Non-binaire',
};

const RELATION_LABELS: Record<RelationshipType, string> = {
  serious: 'Relation sérieuse',
  long_term_chill: 'Long terme détendu',
  open_enm: 'ENM / ouvert',
  polyamory: 'Polyamour',
  casual: 'Casual',
  fwb: 'FWB',
  hookups: 'Rencontres',
  open_to_see: 'Ouvert à voir',
};

const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

// ─── Sous-composant : ligne d'édition ───────────────────────────────────────

type RowProps = {
  label: string;
  preview?: string | null;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
};

function EditRow({ label, preview, onPress, isFirst, isLast }: RowProps) {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        isFirst && styles.rowFirst,
        isLast && styles.rowLast,
        !isLast && styles.rowBorder,
      ]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {preview ? (
          <Text style={styles.rowPreview} numberOfLines={1}>
            {preview}
          </Text>
        ) : (
          <Text style={styles.rowEmpty}>Non renseigné</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#444" />
    </TouchableOpacity>
  );
}

// ─── Composant principal ────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const router = useRouter();

  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: preferences, isLoading: prefsLoading } = useMyPreferences();

  const isLoading = profileLoading || prefsLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0050" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Impossible de charger le profil.</Text>
      </SafeAreaView>
    );
  }

  const age = profile.birth_date ? calculateAge(profile.birth_date) : null;

  const genderPreview = profile.gender
    ? GENDER_LABELS[profile.gender] ?? profile.gender
    : null;

  const relationPreview =
    preferences?.relation_type && preferences.relation_type.length > 0
      ? preferences.relation_type
          .map((t) => RELATION_LABELS[t] ?? t)
          .join(', ')
      : null;

  const locationPreview =
    [profile.town, profile.country].filter(Boolean).join(', ') || null;

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Barre de navigation ── */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Modifier le profil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar ── */}
        <TouchableOpacity
          style={styles.avatarSection}
          onPress={() =>
            router.push('/(protected)/(profile-setup)/avatar?mode=edit')
          }
          activeOpacity={0.7}
        >
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {profile.username?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
          <Text style={styles.avatarHint}>Changer la photo</Text>
        </TouchableOpacity>

        {/* ── Infos de base ── */}
        <Text style={styles.groupLabel}>Infos de base</Text>
        <View style={styles.group}>
          <EditRow
            label="Pseudo"
            preview={profile.username}
            onPress={() => {}}
            isFirst
          />
          <EditRow
            label="Âge"
            preview={age !== null ? `${age} ans` : null}
            onPress={() => {}}
          />
          <EditRow
            label="Ville"
            preview={locationPreview}
            onPress={() =>
              router.push('/(protected)/(profile-setup)/town?mode=edit')
            }
            isLast
          />
        </View>

        {/* ── À mon sujet ── */}
        <Text style={styles.groupLabel}>À mon sujet</Text>
        <View style={styles.group}>
          <EditRow
            label="Genre"
            preview={genderPreview}
            onPress={() =>
              router.push('/(protected)/(profile-setup)/gender?mode=edit')
            }
            isFirst
          />
          <EditRow
            label="Ce que je cherche"
            preview={relationPreview}
            onPress={() =>
              router.push('/(protected)/(profile-setup)/relations?mode=edit')
            }
          />
          <EditRow
            label="Bio"
            preview={profile.bio}
            onPress={() =>
              router.push('/(protected)/(profile-setup)/bio?mode=edit')
            }
            isLast
          />
        </View>

        {/* ── Médias ── */}
        <Text style={styles.groupLabel}>Médias</Text>
        <View style={styles.group}>
          <EditRow
            label="Vidéo de présentation"
            preview={profile.video?.video_url ? 'Vidéo enregistrée' : null}
            onPress={() =>
              router.push('/(protected)/(profile-setup)/uploadVideo?mode=edit')
            }
            isFirst
          />
          <EditRow
            label="Question associée"
            preview={
              profile.video?.question_id
                ? `Question #${profile.video.question_id}`
                : null
            }
            onPress={() =>
              router.push(
                '/(protected)/(profile-setup)/questionPicker?mode=edit'
              )
            }
            isLast
          />
        </View>

        {/* ── Préférences de recherche ── */}
        <Text style={styles.groupLabel}>Préférences de recherche</Text>
        <View style={styles.group}>
          <EditRow
            label="Genres recherchés"
            preview={
              preferences?.gender_preferences &&
              preferences.gender_preferences.length > 0
                ? preferences.gender_preferences
                    .map((g) => (g ? (GENDER_LABELS[g] ?? g) : null))
                    .filter(Boolean)
                    .join(', ')
                : null
            }
            onPress={() =>
              router.push('/(protected)/(profile-setup)/preferences?mode=edit')
            }
            isFirst
          />
          <EditRow
            label="Tranche d'âge"
            preview={
              preferences?.min_age != null && preferences?.max_age != null
                ? `${preferences.min_age} – ${preferences.max_age} ans`
                : null
            }
            onPress={() =>
              router.push('/(protected)/(profile-setup)/preferences?mode=edit')
            }
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#888',
    fontSize: 16,
  },

  // ── Navbar ──
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },

  // ── Scroll ──
  scrollContent: {
    paddingVertical: 24,
    paddingBottom: 48,
  },

  // ── Avatar ──
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#FF0050',
  },
  avatarPlaceholder: {
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 38,
    fontWeight: '700',
    color: '#FF0050',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 24,
    right: '33%',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF0050',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  avatarHint: {
    marginTop: 10,
    fontSize: 14,
    color: '#FF0050',
    fontWeight: '500',
  },

  // ── Groupes ──
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  group: {
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1e1e1e',
    marginBottom: 28,
  },

  // ── Rows ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#111',
  },
  rowFirst: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  rowLast: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowLabel: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  rowPreview: {
    fontSize: 13,
    color: '#666',
  },
  rowEmpty: {
    fontSize: 13,
    color: '#3a3a3a',
    fontStyle: 'italic',
  },
});
