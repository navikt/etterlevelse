package no.nav.data.etterlevelse.export;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.utils.WordDocUtils;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.domain.Codelist;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.Regelverk;
import no.nav.data.etterlevelse.krav.domain.Suksesskriterie;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;
import no.nav.data.integration.begrep.BegrepService;
import no.nav.data.integration.begrep.dto.BegrepResponse;
import org.docx4j.jaxb.Context;
import org.docx4j.wml.ObjectFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KravToDoc {

    private static final ObjectFactory facKrav = Context.getWmlObjectFactory();
    private final KravService kravService;
    private final BegrepService begrepService;


    public byte[] generateDocForKrav(Krav krav) {
        var doc = new KravDocumentBuilder();
        doc.addTitle("Dokumentasjon fo krav");
        doc.generate(krav);

        return doc.build();
    }

    public byte[] generateDocFor(ListName list, List<String> codes, List<String> status) {
        List<Krav> kravList;
        String title;
        switch (list) {
            case RELEVANS -> {
                title = "Krav filtrert med relevans";
                kravList = kravService.getByFilter(KravFilter.builder().relevans(codes).status(status).build());
            }
            case UNDERAVDELING -> {
                title = "Krav filtrert med underavdeling";
                kravList = kravService.getByFilter(KravFilter.builder().underavdeling(codes.get(0)).status(status).build());
            }
            case LOV -> {
                title = "Krav filtrert med lov";
                kravList = kravService.getByFilter(KravFilter.builder().lov(codes.get(0)).status(status).build());
            }
            case TEMA -> {
                title = "Krav filtrert med tema";
                kravList = kravService.getByFilter(KravFilter.builder().lover(codes).status(status).build());
            }
            default -> throw new ValidationException("no list given");
        }

        kravList = new ArrayList<>(kravList);

        var doc = new KravDocumentBuilder();
        doc.addTitle(title);

        doc.addHeading1("Dokumentet inneholder følgende krav (" + kravList.size() +")");
        doc.addToc(kravList);

        for (int i = 0; i < kravList.size(); i++) {
            if (i != kravList.size() - 1) {
                doc.pageBreak();
            }
            doc.generate(kravList.get(i));
        }

        return doc.build();
    }


    class KravDocumentBuilder extends WordDocUtils {

        public KravDocumentBuilder () {
            super(facKrav);
        }

        long listId = 1;

        public void generate(Krav krav) {

            String kravName = "K" + krav.getKravNummer() + "." + krav.getKravVersjon() + " - " + krav.getNavn();

            var header = addHeading1(kravName);

            addBookmark(header, krav.getId().toString());

            addHeading4("Status");
            addText(kravStatusText(krav.getStatus()));

            if(krav.getChangeStamp() != null && krav.getChangeStamp().getLastModifiedBy() != null && krav.getChangeStamp().getLastModifiedDate() != null) {
                addLastEditedBy(krav.getChangeStamp());
            } else {
                addText("Sist endret: Ikke angitt");
            }

            if(krav.getVarselMelding() != null && !krav.getVarselMelding().isEmpty()) {
                addHeading4("Varselmelding");
                addText(krav.getVarselMelding());
            }


            addHeading4("Hensikten med kravet");
            if(krav.getHensikt() != null && !krav.getHensikt().isEmpty()) {
                addMarkdownText(krav.getHensikt());
            }

            for (int s = 0; s < krav.getSuksesskriterier().size(); s++) {
                Suksesskriterie suksesskriterie = krav.getSuksesskriterier().get(s);
                int suksesskriterieNumber = s + 1;
                addHeading4("SUKSESSKRITERIE " + suksesskriterieNumber + " AV " + krav.getSuksesskriterier().size());
                addHeading4(suksesskriterie.getNavn());
                addText("Id: " + suksesskriterie.getId());
                addText("Behov for begrunnelse: " + boolToText(suksesskriterie.isBehovForBegrunnelse()));
                addMarkdownText(suksesskriterie.getBeskrivelse());
            }

            addHeading4("Kilder");
            if(!krav.getDokumentasjon().isEmpty()){
               for(int d = 0; d < krav.getDokumentasjon().size(); d++) {
                   addMarkdownText("- " + krav.getDokumentasjon().get(d));
               }
            } else {
                addText("Ikke angitt");
            }

            addHeading4("Etiketter");
            if(krav.getTagger() != null && !krav.getTagger().isEmpty()){
                addText(String.join(", ", krav.getTagger()));
            } else {
                addText("Ikke angitt");
            }

            addHeading4("Relevante implementasjoner");
            if(krav.getImplementasjoner() != null && !krav.getImplementasjoner().isEmpty()){
                addMarkdownText(krav.getImplementasjoner());
            } else {
                addText("Ikke angitt");
            }

            addHeading4("Begreper");
            if(krav.getBegrepIder() != null && !krav.getBegrepIder().isEmpty()){
                for(int b = 0; b < krav.getBegrepIder().size(); b++) {
                    BegrepResponse begrepResponse = begrepService.getBegrep(krav.getBegrepIder().get(b)).orElse(null);
                    addMarkdownText("- [" + begrepResponse.getNavn() + "]( " + System.getenv("CLIENT_BEGREPSKATALOG_FRONTEND_URL") + "/" +  begrepResponse.getId() +")<br/>" + begrepResponse.getBeskrivelse());
                }
            } else {
                addText("Ikke angitt");
            }

            addHeading4("Relasjoner til andre krav");
            if(krav.getKravIdRelasjoner() != null && !krav.getKravIdRelasjoner().isEmpty()){
                for(int k = 0; k < krav.getKravIdRelasjoner().size(); k++) {
                    Krav kravResponse = kravService.get(UUID.fromString(krav.getKravIdRelasjoner().get(k)));
                    addText("- K" + kravResponse.getKravNummer() + "." + kravResponse.getVersion() + " " + kravResponse.getNavn());
                }
            } else {
                addText("Ikke angitt");
            }

            addHeading4("Krav er relevant for");
            if(krav.getRelevansFor() != null && !krav.getRelevansFor().isEmpty()){
                for(int r = 0; r < krav.getRelevansFor().size(); r++) {
                    Codelist codelist = CodelistService.getCodelist(ListName.RELEVANS, krav.getRelevansFor().get(r));
                    addText("- " + codelist.getShortName());
                }
            } else {
                addText("Ikke angitt");
            }

            addHeading4( "Dette er nytt fra forrige versjon");
            if(krav.getVersjonEndringer() != null && !krav.getVersjonEndringer().isEmpty()){
                addMarkdownText(krav.getVersjonEndringer());
            } else {
                addText("Ikke angitt");
            }


            addHeading4("Ansvarlig");
            if(krav.getUnderavdeling() != null && !krav.getUnderavdeling().isEmpty()){
                    Codelist codelist = CodelistService.getCodelist(ListName.UNDERAVDELING, krav.getUnderavdeling());
                    addText("- " + codelist.getShortName());
            } else {
                addText("Ikke angitt");
            }

            addHeading4("Regelverk");
            if(krav.getRegelverk() != null && !krav.getRegelverk().isEmpty()){
                for(int l = 0; l < krav.getRegelverk().size(); l++) {
                    Regelverk regelverk = krav.getRegelverk().get(l);

                    Codelist codelist = CodelistService.getCodelist(ListName.LOV, regelverk.getLov());
                    addText("- " + codelist.getShortName() + " " + regelverk.getSpesifisering());
                }
            } else {
                addText("Ikke angitt");
            }

            addHeading4("Varslingsadresser");
            if(krav.getVarslingsadresser() != null && !krav.getVarslingsadresser().isEmpty()){
                for(int v = 0; v < krav.getVarslingsadresser().size(); v++) {
                    Varslingsadresse varslingsadresse = krav.getVarslingsadresser().get(v);

                    addText("- " + adresseTypeText(varslingsadresse.getType()) + ": " + varslingsadresse.getAdresse());
                }
            } else {
                addText("Ikke angitt");
            }

        }

        public String kravStatusText(KravStatus status) {
            return switch (status) {
                case UTGAATT -> "Utgått";
                case UTKAST -> "Utkast";
                case AKTIV -> "Aktiv";
                case UNDER_ARBEID -> "Under arbeid";
            };
        }

        public void addToc(List<Krav> kravList) {

            long currListId = listId++;

            for (Krav krav : kravList) {
                var name = "K" + krav.getKravNummer() + "." + krav.getKravVersjon() + " - " + krav.getNavn();
                var bookmark = krav.getId().toString();

                addListItem(name, currListId, bookmark);
            }
        }
    }
}
