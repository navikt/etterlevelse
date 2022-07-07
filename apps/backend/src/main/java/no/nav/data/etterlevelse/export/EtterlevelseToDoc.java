package no.nav.data.etterlevelse.export;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.utils.WordDocUtils;
import no.nav.data.etterlevelse.behandling.BehandlingService;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.krav.KravService;
import org.docx4j.jaxb.Context;
import org.docx4j.wml.ObjectFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EtterlevelseToDoc {
    private static final ObjectFactory etterlevelseFactory = Context.getWmlObjectFactory();
    private EtterlevelseService etterlevelseService;
    private KravService kravService;
    private BehandlingService behandlingService;

    public byte[] generateDocForEtterlevelse(Etterlevelse etterlevelse){
        var behandling = behandlingService.getBehandling(etterlevelse.getBehandlingId());
        var doc = new EtterlevelseDocumentBuilder();
        doc.addTitle("Etterlevelse for B" + behandling.getNummer());
        return doc.build();
    }

    class EtterlevelseDocumentBuilder extends WordDocUtils {

        public EtterlevelseDocumentBuilder() {
            super(etterlevelseFactory);
        }

        long listId = 1;

        public void generate(Etterlevelse etterlevelse) {
            var krav = kravService.getByKravNummer(etterlevelse.getKravNummer(), etterlevelse.getKravVersjon());
            String etterlevelseName = "Etterlevelse for K" + krav.get().getKravNummer() + "." + krav.get().getKravVersjon();

            var header = addHeading1(etterlevelseName);

            addBookmark(header, etterlevelse.getId().toString());

        }

        public String etterlevelseStatusText(EtterlevelseStatus status) {
            return switch (status) {
                case UNDER_REDIGERING -> "Under arbeid";
                case FERDIG -> "Oppfylt";
                case OPPFYLLES_SENERE -> "Oppfyles senere";
                case IKKE_RELEVANT -> "Ikke relevant";
                case FERDIG_DOKUMENTERT -> "Oppfylt og ferdig dokumentert";
                case IKKE_RELEVANT_FERDIG_DOKUMENTERT -> "Ikke relevant og ferdig dokumentert ";
            };
        }

        public void addTableOfContent(List<Etterlevelse> etterlevelseList) {

            long currListId = listId++;

            for (Etterlevelse etterlevelse : etterlevelseList) {
                var name = "K" + etterlevelse.getKravNummer() + "." + etterlevelse.getKravVersjon();
                var bookmark = etterlevelse.getId().toString();
                addListItem(name, currListId, bookmark);
            }
        }
    }
}
